import { Response } from "express";
import { z } from "zod";

import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";

const attendanceStatusSchema = z.enum([
  "PRESENT",
  "ABSENT",
  "HALF_DAY",
  "WORK_FROM_HOME",
  "ON_LEAVE",
]);

const createAttendanceSchema = z.object({
  employeeId: z.string().min(1, "Employee is required"),

  date: z.string().min(1, "Date is required"),

  status: attendanceStatusSchema,

  checkIn: z.string().optional().nullable(),

  checkOut: z.string().optional().nullable(),

  notes: z.string().optional().nullable(),
});

const updateAttendanceSchema = z.object({
  status: attendanceStatusSchema.optional(),

  checkIn: z.string().optional().nullable(),

  checkOut: z.string().optional().nullable(),

  notes: z.string().optional().nullable(),
});

function parseDate(date: string, baseDate?: Date | string | null): Date | null {
  if (!date) return null;
  const trimmed = date.trim();
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    const base = baseDate ? new Date(baseDate) : new Date();
    if (Number.isNaN(base.getTime())) return null;
    const parts = trimmed.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parts[2] ? parseInt(parts[2], 10) : 0;
    const result = new Date(base);
    result.setHours(hours, minutes, seconds, 0);
    return result;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

export async function getAttendance(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const organizationId = req.user.organizationId;

    const employeeId =
      typeof req.query.employeeId === "string"
        ? req.query.employeeId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    const from =
      typeof req.query.from === "string"
        ? req.query.from
        : undefined;

    const to =
      typeof req.query.to === "string"
        ? req.query.to
        : undefined;

    const where: any = {
      organizationId,
    };

    if (employeeId) {
      where.employeeId = employeeId;
    }

    if (status) {
      where.status = status;
    }

    if (date) {
      const parsedDate = parseDate(date);

      if (!parsedDate) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      const startOfDay = new Date(parsedDate);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(parsedDate);
      endOfDay.setHours(23, 59, 59, 999);

      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (from || to) {
      const dateFilter: any = {};

      if (from) {
        const fromDate = parseDate(from);

        if (!fromDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid from date",
          });
        }

        fromDate.setHours(0, 0, 0, 0);
        dateFilter.gte = fromDate;
      }

      if (to) {
        const toDate = parseDate(to);

        if (!toDate) {
          return res.status(400).json({
            success: false,
            message: "Invalid to date",
          });
        }

        toDate.setHours(23, 59, 59, 999);
        dateFilter.lte = toDate;
      }

      where.date = dateFilter;
    }

    const attendance = await prisma.attendance.findMany({
      where,

      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },

      orderBy: [
        {
          date: "desc",
        },
        {
          employee: {
            firstName: "asc",
          },
        },
      ],
    });

    return res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance",
    });
  }
}

export async function getAttendanceById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const attendanceId = String(req.params.id);

    const attendance = await prisma.attendance.findFirst({
      where: {
        id: attendanceId,
        organizationId: req.user.organizationId,
      },

      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    return res.json({
      success: true,
      data: attendance,
    });
  } catch (error) {
    console.error("Get attendance record error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch attendance record",
    });
  }
}

export async function createAttendance(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const validation = createAttendanceSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Invalid attendance data",
      });
    }

    const data = validation.data;

    const attendanceDate = parseDate(data.date);

    if (!attendanceDate) {
      return res.status(400).json({
        success: false,
        message: "Invalid attendance date",
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        organizationId: req.user.organizationId,
      },
    });

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee not found",
      });
    }

    const startOfDay = new Date(attendanceDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(attendanceDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          employeeId: data.employeeId,

          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message:
          "Attendance has already been marked for this employee on this date",
      });
    }

    const attendance =
      await prisma.attendance.create({
        data: {
          organizationId:
            req.user.organizationId,

          employeeId: data.employeeId,

          date: startOfDay,

          status: data.status,

          checkIn: data.checkIn
            ? parseDate(data.checkIn, startOfDay)
            : null,

          checkOut: data.checkOut
            ? parseDate(data.checkOut, startOfDay)
            : null,

          notes: data.notes?.trim() || null,
        },

        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              email: true,
              jobTitle: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Create attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
    });
  }
}

export async function updateAttendance(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const attendanceId = String(req.params.id);

    const validation =
      updateAttendanceSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Invalid attendance data",
      });
    }

    const data = validation.data;

    const existingAttendance =
      await prisma.attendance.findFirst({
        where: {
          id: attendanceId,
          organizationId: req.user.organizationId,
        },
      });

    if (!existingAttendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    const attendance =
      await prisma.attendance.update({
        where: {
          id: attendanceId,
        },

        data: {
          ...(data.status !== undefined && {
            status: data.status,
          }),

          ...(data.checkIn !== undefined && {
            checkIn: data.checkIn
              ? parseDate(data.checkIn, existingAttendance.date)
              : null,
          }),

          ...(data.checkOut !== undefined && {
            checkOut: data.checkOut
              ? parseDate(data.checkOut, existingAttendance.date)
              : null,
          }),

          ...(data.notes !== undefined && {
            notes: data.notes?.trim() || null,
          }),
        },

        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              email: true,
              jobTitle: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

    return res.json({
      success: true,
      message: "Attendance updated successfully",
      data: attendance,
    });
  } catch (error) {
    console.error("Update attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update attendance",
    });
  }
}

export async function deleteAttendance(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const attendanceId = String(req.params.id);

    const attendance =
      await prisma.attendance.findFirst({
        where: {
          id: attendanceId,
          organizationId: req.user.organizationId,
        },
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found",
      });
    }

    await prisma.attendance.delete({
      where: {
        id: attendanceId,
      },
    });

    return res.json({
      success: true,
      message: "Attendance record deleted successfully",
    });
  } catch (error) {
    console.error("Delete attendance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete attendance",
    });
  }
}
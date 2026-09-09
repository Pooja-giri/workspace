import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";
import { initializeEmployeeLeaveBalances } from "../services/leaveBalance.service";

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  jobTitle: z.string().min(2),
  departmentId: z.string().optional(),
  managerId: z.string().optional(),
  employmentType: z.enum([
    "FULL_TIME",
    "PART_TIME",
    "CONTRACTOR",
    "INTERN",
  ]),
  joiningDate: z.string(),
  password: z.string().min(8),
});

const updateEmployeeSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  jobTitle: z.string().min(2).optional(),
  departmentId: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
  employmentType: z
    .enum([
      "FULL_TIME",
      "PART_TIME",
      "CONTRACTOR",
      "INTERN",
    ])
    .optional(),
  joiningDate: z.string().optional(),
  employmentStatus: z
    .enum([
      "ACTIVE",
      "INACTIVE",
      "ON_LEAVE",
      "TERMINATED",
    ])
    .optional(),
});

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);

  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
  };
}

/**
 * GET /api/employees
 */
export async function getEmployees(
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

    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim()
        : "";

    const departmentId =
      typeof req.query.departmentId === "string"
        ? req.query.departmentId
        : undefined;

    const status =
      typeof req.query.status === "string"
        ? req.query.status
        : undefined;

    const page =
      typeof req.query.page === "string"
        ? Math.max(Number(req.query.page), 1)
        : 1;

    const limit =
      typeof req.query.limit === "string"
        ? Math.min(Math.max(Number(req.query.limit), 1), 100)
        : 10;

    const skip = (page - 1) * limit;

    const where: any = {
      organizationId,
    };

    if (search) {
      where.OR = [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          employeeCode: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          jobTitle: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    if (departmentId) {
      where.departmentId = departmentId;
    }

    if (status) {
      where.employmentStatus = status;
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: true,
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              employeeCode: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.employee.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: employees,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees",
    });
  }
}

/**
 * GET /api/employees/:id
 */
export async function getEmployee(
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

    const employee = await prisma.employee.findFirst({
      where: {
        id: String(req.params.id),
        organizationId: req.user.organizationId,
      },
      include: {
        department: true,
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            jobTitle: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            isActive: true,
          },
        },
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      data: employee,
    });
  } catch (error) {
    console.error("Get employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee",
    });
  }
}

/**
 * POST /api/employees
 */
export async function createEmployee(
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

    const validation = createEmployeeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Invalid employee data",
      });
    }

    const data = validation.data;

    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email.toLowerCase(),
      },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists",
      });
    }

    if (data.departmentId) {
      const department = await prisma.department.findFirst({
        where: {
          id: data.departmentId,
          organizationId: req.user.organizationId,
        },
      });

      if (!department) {
        return res.status(400).json({
          success: false,
          message: "Invalid department",
        });
      }
    }

    if (data.managerId) {
      const manager = await prisma.employee.findFirst({
        where: {
          id: data.managerId,
          organizationId: req.user.organizationId,
        },
      });

      if (!manager) {
        return res.status(400).json({
          success: false,
          message: "Invalid manager",
        });
      }
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const { firstName, lastName } = splitName(data.name);

    const employee = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: data.name.trim(),
          email: data.email.toLowerCase().trim(),
          passwordHash,
        },
      });

      const employeeCount = await tx.employee.count({
        where: {
          organizationId: req.user!.organizationId,
        },
      });

      const employeeCode = `EMP-${String(
        employeeCount + 1
      ).padStart(4, "0")}`;

      const createdEmployee = await tx.employee.create({
        data: {
          organizationId: req.user!.organizationId,
          userId: user.id,
          employeeCode,
          firstName,
          lastName,
          email: data.email.toLowerCase().trim(),
          phone: data.phone || null,
          jobTitle: data.jobTitle,
          departmentId: data.departmentId || null,
          managerId: data.managerId || null,
          employmentType: data.employmentType,
          employmentStatus: "ACTIVE",
          joiningDate: new Date(data.joiningDate),
        },
        include: {
          department: true,
          manager: true,
        },
      });

      await initializeEmployeeLeaveBalances(
        createdEmployee.id,
        req.user!.organizationId
      );

      return createdEmployee;
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create employee",
    });
  }
}

/**
 * PUT /api/employees/:id
 */
export async function updateEmployee(
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

    const validation = updateEmployeeSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Invalid employee data",
      });
    }

    const existingEmployee = await prisma.employee.findFirst({
      where: {
        id: String(req.params.id),
        organizationId: req.user.organizationId,
      },
    });

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const data = validation.data;

    let firstName: string | undefined;
    let lastName: string | undefined;

    if (data.name) {
      const names = splitName(data.name);
      firstName = names.firstName;
      lastName = names.lastName;
    }

    const employee = await prisma.$transaction(async (tx) => {
      const updated = await tx.employee.update({
        where: {
          id: existingEmployee.id,
        },
        data: {
          ...(firstName !== undefined && {
            firstName,
          }),

          ...(lastName !== undefined && {
            lastName,
          }),

          ...(data.email !== undefined && {
            email: data.email.toLowerCase().trim(),
          }),

          ...(data.phone !== undefined && {
            phone: data.phone,
          }),

          ...(data.jobTitle !== undefined && {
            jobTitle: data.jobTitle,
          }),

          ...(data.departmentId !== undefined && {
            departmentId: data.departmentId,
          }),

          ...(data.managerId !== undefined && {
            managerId: data.managerId,
          }),

          ...(data.employmentType !== undefined && {
            employmentType: data.employmentType,
          }),

          ...(data.employmentStatus !== undefined && {
            employmentStatus: data.employmentStatus,
          }),

          ...(data.joiningDate !== undefined && {
            joiningDate: new Date(data.joiningDate),
          }),
        },
        include: {
          department: true,
          manager: true,
        },
      });

      if (data.name || data.email) {
        await tx.user.update({
          where: {
            id: existingEmployee.userId,
          },
          data: {
            ...(data.name && {
              name: data.name.trim(),
            }),

            ...(data.email && {
              email: data.email.toLowerCase().trim(),
            }),
          },
        });
      }

      return updated;
    });

    return res.json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
}

/**
 * PATCH /api/employees/:id/status
 */
export async function updateEmployeeStatus(
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

    const schema = z.object({
      status: z.enum([
        "ACTIVE",
        "INACTIVE",
        "ON_LEAVE",
        "TERMINATED",
      ]),
    });

    const validation = schema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee status",
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: String(req.params.id),
        organizationId: req.user.organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const updated = await prisma.employee.update({
      where: {
        id: employee.id,
      },
      data: {
        employmentStatus: validation.data.status,
      },
    });

    await prisma.user.update({
      where: {
        id: employee.userId,
      },
      data: {
        isActive:
          validation.data.status === "ACTIVE",
      },
    });

    return res.json({
      success: true,
      message: "Employee status updated",
      data: updated,
    });
  } catch (error) {
    console.error("Update employee status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update employee status",
    });
  }
}

/**
 * POST /api/employees/bulk
 * Bulk update employees (status, department)
 */
export async function bulkUpdateEmployees(
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

    const bulkSchema = z.object({
      employeeIds: z.array(z.string()).min(1, "At least one employee ID is required"),
      action: z.enum(["CHANGE_STATUS", "CHANGE_DEPARTMENT", "DELETE"]),
      status: z.enum(["ACTIVE", "INACTIVE", "ON_LEAVE", "TERMINATED"]).optional(),
      departmentId: z.string().nullable().optional(),
    });

    const validation = bulkSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid bulk update data",
      });
    }

    const { employeeIds, action, status, departmentId } = validation.data;
    const organizationId = req.user.organizationId;

    if (action === "CHANGE_STATUS") {
      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required for status update",
        });
      }

      await prisma.employee.updateMany({
        where: {
          id: { in: employeeIds },
          organizationId,
        },
        data: {
          employmentStatus: status,
        },
      });

      return res.json({
        success: true,
        message: `Successfully updated status for ${employeeIds.length} employee(s)`,
      });
    }

    if (action === "CHANGE_DEPARTMENT") {
      if (departmentId) {
        const department = await prisma.department.findFirst({
          where: { id: departmentId, organizationId },
        });
        if (!department) {
          return res.status(400).json({
            success: false,
            message: "Target department does not exist in this organization",
          });
        }
      }

      await prisma.employee.updateMany({
        where: {
          id: { in: employeeIds },
          organizationId,
        },
        data: {
          departmentId: departmentId || null,
        },
      });

      return res.json({
        success: true,
        message: `Successfully updated department for ${employeeIds.length} employee(s)`,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unsupported bulk action",
    });
  } catch (error) {
    console.error("Bulk update employees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to perform bulk operation",
    });
  }
}

/**
 * POST /api/employees/import
 * Batch import employees from CSV data
 */
export async function importEmployees(
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

    const importSchema = z.object({
      employees: z.array(
        z.object({
          name: z.string().min(2),
          email: z.string().email(),
          jobTitle: z.string().min(2),
          departmentName: z.string().optional(),
          employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACTOR", "INTERN"]).optional().default("FULL_TIME"),
          phone: z.string().optional(),
          joiningDate: z.string().optional(),
        })
      ).min(1, "No employees provided"),
    });

    const validation = importSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: validation.error.issues[0]?.message || "Invalid import data",
      });
    }

    const { employees } = validation.data;
    const organizationId = req.user.organizationId;

    const departments = await prisma.department.findMany({
      where: { organizationId },
    });
    const deptMap = new Map<string, string>();
    departments.forEach((d) => deptMap.set(d.name.toLowerCase().trim(), d.id));

    let createdCount = 0;
    const errors: string[] = [];

    const defaultPasswordHash = await bcrypt.hash("WorkSphere@2026", 10);

    for (const emp of employees) {
      try {
        const email = emp.email.toLowerCase().trim();
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
          errors.push(`Email already exists: ${email}`);
          continue;
        }

        let deptId: string | null = null;
        if (emp.departmentName) {
          const match = deptMap.get(emp.departmentName.toLowerCase().trim());
          if (match) {
            deptId = match;
          } else {
            const newDept = await prisma.department.create({
              data: {
                organizationId,
                name: emp.departmentName.trim(),
              },
            });
            deptMap.set(emp.departmentName.toLowerCase().trim(), newDept.id);
            deptId = newDept.id;
          }
        }

        const { firstName, lastName } = splitName(emp.name);
        const count = await prisma.employee.count({ where: { organizationId } });
        const employeeCode = `EMP-${String(count + 1).padStart(4, "0")}`;

        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              name: emp.name.trim(),
              email,
              passwordHash: defaultPasswordHash,
            },
          });

          const created = await tx.employee.create({
            data: {
              organizationId,
              userId: user.id,
              employeeCode,
              firstName,
              lastName,
              email,
              phone: emp.phone || null,
              jobTitle: emp.jobTitle.trim(),
              departmentId: deptId,
              employmentType: emp.employmentType || "FULL_TIME",
              employmentStatus: "ACTIVE",
              joiningDate: emp.joiningDate ? new Date(emp.joiningDate) : new Date(),
            },
          });

          await initializeEmployeeLeaveBalances(created.id, organizationId);
        });

        createdCount++;
      } catch (err: any) {
        errors.push(`Failed to import ${emp.name} (${emp.email}): ${err?.message || "Unknown error"}`);
      }
    }

    return res.status(201).json({
      success: true,
      message: `Successfully imported ${createdCount} of ${employees.length} employees`,
      data: {
        total: employees.length,
        created: createdCount,
        failed: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error("Import employees error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to import employees",
    });
  }
}
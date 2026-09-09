import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";

const createGoalSchema = z.object({
  employeeId: z.string().min(1),
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  priority: z.string().optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "AT_RISK", "ON_HOLD"])
    .optional(),
});

const updateGoalSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  targetValue: z.number().optional(),
  currentValue: z.number().optional(),
  progress: z.number().min(0).max(100).optional(),
  priority: z.string().optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "AT_RISK", "ON_HOLD"])
    .optional(),
});

export const getGoals = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const {
      employeeId,
      status,
      page = "1",
      limit = "20",
    } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);

    const where: any = {
      organizationId,
    };

    if (typeof employeeId === "string") {
      where.employeeId = employeeId;
    }

    if (
      typeof status === "string" &&
      ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "AT_RISK"].includes(status)
    ) {
      where.status = status;
    }

    const [goals, total] = await prisma.$transaction([
      prisma.goal.findMany({
        where,
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
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
        orderBy: {
          dueDate: "asc",
        },
        skip: (currentPage - 1) * pageLimit,
        take: pageLimit,
      }),

      prisma.goal.count({
        where,
      }),
    ]);

    return res.json({
      success: true,
      data: goals,
      pagination: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
    });
  } catch (error) {
    console.error("Get goals error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch goals",
    });
  }
};

export const getGoalById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        organizationId,
      },
      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
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

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    return res.json({
      success: true,
      data: goal,
    });
  } catch (error) {
    console.error("Get goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch goal",
    });
  }
};

export const createGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const parsed = createGoalSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal data",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    const employee = await prisma.employee.findFirst({
      where: {
        id: data.employeeId,
        organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    let progress = data.progress;
    if (
      progress === undefined &&
      data.currentValue !== undefined &&
      data.targetValue &&
      data.targetValue > 0
    ) {
      progress = Math.min(
        Math.round((data.currentValue / data.targetValue) * 100),
        100
      );
    }
    progress = progress ?? 0;

    let status =
      data.status === "ON_HOLD"
        ? "NOT_STARTED"
        : (data.status as any) || "NOT_STARTED";

    if (progress === 100 && !data.status) {
      status = "COMPLETED";
    }

    const goal = await prisma.goal.create({
      data: {
        organizationId,
        employeeId: data.employeeId,
        title: data.title,
        description: data.description,
        dueDate: data.dueDate,
        progress,
        status,
      },

      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
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
      message: "Goal created successfully",
      data: goal,
    });
  } catch (error) {
    console.error("Create goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create goal",
    });
  }
};

export const updateGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateGoalSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid goal data",
        errors: parsed.error.flatten(),
      });
    }

    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingGoal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    const data = parsed.data;
    let progress = data.progress;
    if (
      progress === undefined &&
      data.currentValue !== undefined &&
      data.targetValue &&
      data.targetValue > 0
    ) {
      progress = Math.min(
        Math.round((data.currentValue / data.targetValue) * 100),
        100
      );
    }

    let status: any = data.status ?? existingGoal.status;
    if (status === "ON_HOLD") {
      status = "NOT_STARTED";
    }
    if (progress === 100 && !data.status) {
      status = "COMPLETED";
    }

    const goal = await prisma.goal.update({
      where: {
        id,
      },

      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate } : {}),
        ...(progress !== undefined ? { progress } : {}),
        status,
      },

      include: {
        employee: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
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
      message: "Goal updated successfully",
      data: goal,
    });
  } catch (error) {
    console.error("Update goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update goal",
    });
  }
};

export const deleteGoal = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: "Goal not found",
      });
    }

    await prisma.goal.delete({
      where: {
        id,
      },
    });

    return res.json({
      success: true,
      message: "Goal deleted successfully",
    });
  } catch (error) {
    console.error("Delete goal error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete goal",
    });
  }
};
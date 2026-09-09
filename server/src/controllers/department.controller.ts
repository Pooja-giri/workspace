import { Response } from "express";
import { z } from "zod";

import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";

const createDepartmentSchema = z.object({
  name: z.string().min(2, "Department name is required"),
  description: z.string().optional(),
  managerId: z.string().nullable().optional(),
});

const updateDepartmentSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().nullable().optional(),
  managerId: z.string().nullable().optional(),
});

/**
 * GET /api/departments
 *
 * Returns all departments belonging to the
 * authenticated user's organization.
 */
export async function getDepartments(
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

    const where: any = {
      organizationId,
    };

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            jobTitle: true,
          },
        },
        _count: {
          select: {
            employees: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      success: true,
      data: departments,
    });
  } catch (error) {
    console.error("Get departments error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch departments",
    });
  }
}

/**
 * GET /api/departments/:id
 *
 * Returns a single department with its employees.
 */
export async function getDepartment(
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

    const departmentId = String(req.params.id);

    const department = await prisma.department.findFirst({
      where: {
        id: departmentId,
        organizationId: req.user.organizationId,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            jobTitle: true,
            email: true,
          },
        },

        employees: {
          orderBy: {
            firstName: "asc",
          },
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            email: true,
            jobTitle: true,
            employmentStatus: true,
            employmentType: true,
            joiningDate: true,
          },
        },

        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.json({
      success: true,
      data: department,
    });
  } catch (error) {
    console.error("Get department error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch department",
    });
  }
}

/**
 * POST /api/departments
 */
export async function createDepartment(
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

    const validation = createDepartmentSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Invalid department data",
      });
    }

    const data = validation.data;

    const existingDepartment =
      await prisma.department.findFirst({
        where: {
          organizationId: req.user.organizationId,
          name: {
            equals: data.name.trim(),
            mode: "insensitive",
          },
        },
      });

    if (existingDepartment) {
      return res.status(400).json({
        success: false,
        message:
          "A department with this name already exists",
      });
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
          message: "Invalid department manager",
        });
      }
    }

    const department = await prisma.department.create({
      data: {
        organizationId: req.user.organizationId,
        name: data.name.trim(),
        description:
          data.description?.trim() || null,
        managerId: data.managerId || null,
      },

      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            jobTitle: true,
          },
        },

        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: department,
    });
  } catch (error) {
    console.error("Create department error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create department",
    });
  }
}

/**
 * PUT /api/departments/:id
 */
export async function updateDepartment(
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

    const departmentId = String(req.params.id);

    const validation = updateDepartmentSchema.safeParse(
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message:
          validation.error.issues[0]?.message ||
          "Invalid department data",
      });
    }

    const data = validation.data;

    const existingDepartment =
      await prisma.department.findFirst({
        where: {
          id: departmentId,
          organizationId: req.user.organizationId,
        },
      });

    if (!existingDepartment) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (data.name) {
      const duplicateDepartment =
        await prisma.department.findFirst({
          where: {
            organizationId: req.user.organizationId,

            name: {
              equals: data.name.trim(),
              mode: "insensitive",
            },

            NOT: {
              id: departmentId,
            },
          },
        });

      if (duplicateDepartment) {
        return res.status(400).json({
          success: false,
          message:
            "A department with this name already exists",
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
          message: "Invalid department manager",
        });
      }
    }

    const department = await prisma.department.update({
      where: {
        id: departmentId,
      },

      data: {
        ...(data.name !== undefined && {
          name: data.name.trim(),
        }),

        ...(data.description !== undefined && {
          description:
            data.description?.trim() || null,
        }),

        ...(data.managerId !== undefined && {
          managerId: data.managerId,
        }),
      },

      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeCode: true,
            jobTitle: true,
          },
        },

        _count: {
          select: {
            employees: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: "Department updated successfully",
      data: department,
    });
  } catch (error) {
    console.error("Update department error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update department",
    });
  }
}

/**
 * DELETE /api/departments/:id
 */
export async function deleteDepartment(
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

    const departmentId = String(req.params.id);

    const department =
      await prisma.department.findFirst({
        where: {
          id: departmentId,
          organizationId: req.user.organizationId,
        },

        include: {
          _count: {
            select: {
              employees: true,
            },
          },
        },
      });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (department._count.employees > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete a department that has employees. Reassign employees first.",
      });
    }

    await prisma.department.delete({
      where: {
        id: departmentId,
      },
    });

    return res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Delete department error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete department",
    });
  }
}
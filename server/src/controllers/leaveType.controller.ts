import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";

function getOrganizationId(req: AuthenticatedRequest): string {
  return req.user?.organizationId ?? "";
}

const leaveTypeSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(20),
  daysPerYear: z.number().int().min(0),
  isPaid: z.boolean().optional(),
  carryForward: z.boolean().optional(),
});

function getLeaveTypeId(req: AuthenticatedRequest): string {
  const { id } = req.params;
  return Array.isArray(id) ? id[0] ?? "" : id;
}

export async function getLeaveTypes(req: AuthenticatedRequest, res: Response) {
  try {
    const organizationId = getOrganizationId(req);

    const leaveTypes = await prisma.leaveType.findMany({
      where: {
        organizationId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return res.json({
      success: true,
      data: leaveTypes,
    });
  } catch (error) {
    console.error("getLeaveTypes error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave types",
    });
  }
}

export async function getLeaveTypeById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const organizationId = getOrganizationId(req);

    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id: getLeaveTypeId(req),
        organizationId,
      },
    });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    return res.json({
      success: true,
      data: leaveType,
    });
  } catch (error) {
    console.error("getLeaveTypeById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave type",
    });
  }
}

export async function createLeaveType(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const organizationId = getOrganizationId(req);

    const parsed = leaveTypeSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type data",
        errors: parsed.error.flatten(),
      });
    }

    const existing = await prisma.leaveType.findFirst({
      where: {
        organizationId,
        OR: [
          {
            name: parsed.data.name,
          },
          {
            code: parsed.data.code,
          },
        ],
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "A leave type with this name or code already exists",
      });
    }

    const leaveType = await prisma.leaveType.create({
      data: {
        organizationId,
        name: parsed.data.name,
        code: parsed.data.code,
        daysPerYear: parsed.data.daysPerYear,
        isPaid: parsed.data.isPaid ?? true,
        carryForward: parsed.data.carryForward ?? false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Leave type created successfully",
      data: leaveType,
    });
  } catch (error) {
    console.error("createLeaveType error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create leave type",
    });
  }
}

export async function updateLeaveType(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const organizationId = getOrganizationId(req);

    const parsed = leaveTypeSchema.partial().safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type data",
      });
    }

    const existing = await prisma.leaveType.findFirst({
      where: {
        id: getLeaveTypeId(req),
        organizationId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    const leaveType = await prisma.leaveType.update({
      where: {
        id: existing.id,
      },
      data: parsed.data,
    });

    return res.json({
      success: true,
      message: "Leave type updated successfully",
      data: leaveType,
    });
  } catch (error) {
    console.error("updateLeaveType error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update leave type",
    });
  }
}

export async function deleteLeaveType(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const organizationId = getOrganizationId(req);

    const existing = await prisma.leaveType.findFirst({
      where: {
        id: getLeaveTypeId(req),
        organizationId,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    await prisma.leaveType.delete({
      where: {
        id: existing.id,
      },
    });

    return res.json({
      success: true,
      message: "Leave type deleted successfully",
    });
  } catch (error) {
    console.error("deleteLeaveType error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete leave type",
    });
  }
}
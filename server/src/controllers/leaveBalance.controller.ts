import { Response } from "express";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";
import { initializeEmployeeLeaveBalances } from "../services/leaveBalance.service";

export const initializeEmployeeBalances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const employeeId = Array.isArray(req.params.employeeId)
      ? req.params.employeeId[0]
      : req.params.employeeId;

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const balances = await initializeEmployeeLeaveBalances(
      employee.id,
      organizationId
    );

    return res.status(200).json({
      success: true,
      message: "Leave balances initialized successfully",
      data: balances,
    });
  } catch (error) {
    console.error(
      "Initialize employee leave balances error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to initialize leave balances",
    });
  }
};

export const getEmployeeLeaveBalances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const employeeId = Array.isArray(req.params.employeeId)
      ? req.params.employeeId[0]
      : req.params.employeeId;

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        organizationId,
      },
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const currentYear = new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: {
        employeeId,
        year: currentYear,
      },
      include: {
        leaveType: true,
      },
      orderBy: {
        leaveType: {
          name: "asc",
        },
      },
    });

    const data = balances.map((balance) => ({
      id: balance.id,
      year: balance.year,
      totalDays: balance.totalDays,
      usedDays: balance.usedDays,
      carriedForward: balance.carriedForward,
      availableDays: balance.totalDays + balance.carriedForward - balance.usedDays,
      leaveType: balance.leaveType,
    }));

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get employee leave balances error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave balances",
    });
  }
};
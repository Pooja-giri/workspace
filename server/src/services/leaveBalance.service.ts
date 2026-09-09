import { prisma } from "../config/prisma";

export const initializeEmployeeLeaveBalances = async (
  employeeId: string,
  organizationId: string,
  year = new Date().getFullYear()
) => {
  const leaveTypes = await prisma.leaveType.findMany({
    where: {
      organizationId,
      isActive: true,
    },
  });

  if (leaveTypes.length === 0) {
    return [];
  }

  const balances = [];

  for (const leaveType of leaveTypes) {
    const balance = await prisma.leaveBalance.upsert({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: leaveType.id,
          year,
        },
      },

      update: {},

      create: {
        organizationId,
        employeeId,
        leaveTypeId: leaveType.id,
        year,
        totalDays: leaveType.daysPerYear,
        usedDays: 0,
        carriedForward: 0,
      },
    });

    balances.push(balance);
  }

  return balances;
};
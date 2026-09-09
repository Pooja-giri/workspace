import { Response } from "express";
import { prisma } from "../config/prisma";
import { createNotification } from "../services/notification.service";
import { createActivity } from "../services/activity.service";
import { AuthenticatedRequest } from "../types/auth";

/**
 * Create a leave request
 */
export const createLeaveRequest = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const {
      employeeId,
      leaveTypeId,
      startDate,
      endDate,
      reason,
    } = req.body;

    if (
      !employeeId ||
      !leaveTypeId ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeId, leaveTypeId, startDate and endDate are required",
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid startDate or endDate",
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message:
          "End date cannot be before start date",
      });
    }

    const employee = await prisma.employee.findFirst({
      where: {
        id: employeeId,
        organizationId,
      },
      include: {
        manager: {
          include: {
            user: true,
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

    const leaveType = await prisma.leaveType.findFirst({
      where: {
        id: leaveTypeId,
        organizationId,
        isActive: true,
      },
    });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    /**
     * Calculate total leave days.
     * Inclusive of both start and end dates.
     */
    const millisecondsPerDay =
      1000 * 60 * 60 * 24;

    const totalDays =
      Math.floor(
        (end.getTime() - start.getTime()) /
          millisecondsPerDay
      ) + 1;

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave duration",
      });
    }

    /**
     * Check for overlapping leave requests.
     */
    const overlappingRequest =
      await prisma.leaveRequest.findFirst({
        where: {
          organizationId,
          employeeId,
          status: {
            in: ["PENDING", "APPROVED"],
          },
          startDate: {
            lte: end,
          },
          endDate: {
            gte: start,
          },
        },
      });

    if (overlappingRequest) {
      return res.status(409).json({
        success: false,
        message:
          "Employee already has a leave request for these dates",
      });
    }

    /**
     * Check leave balance.
     */
    const year = start.getFullYear();

    const leaveBalance =
      await prisma.leaveBalance.findFirst({
        where: {
          employeeId,
          leaveTypeId,
          year,
          organizationId,
        },
      });

    if (leaveBalance) {
      const availableDays =
        leaveBalance.totalDays +
        leaveBalance.carriedForward -
        leaveBalance.usedDays;

      if (totalDays > availableDays) {
        return res.status(400).json({
          success: false,
          message: `Insufficient leave balance. Available: ${availableDays} days`,
        });
      }
    }

    /**
     * Create leave request.
     */
    const leaveRequest =
      await prisma.leaveRequest.create({
        data: {
          organizationId,
          employeeId,
          leaveTypeId,
          startDate: start,
          endDate: end,
          totalDays,
          reason: reason || null,
          status: "PENDING",
        },
        include: {
          employee: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          leaveType: true,
        },
      });

    /**
     * STEP 15.5
     * Create activity log.
     */
    await createActivity({
      organizationId,
      userId: req.user!.userId,
      action: "CREATED",
      entityType: "LEAVE_REQUEST",
      entityId: leaveRequest.id,
      metadata: {
        employeeId: employee.id,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        leaveType: leaveType.name,
        totalDays,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
    });

    /**
     * Notify manager if employee has one.
     */
    if (employee.manager?.userId) {
      await createNotification({
        organizationId,
        userId: employee.manager.userId,
        type: "LEAVE_REQUEST",
        title: "New Leave Request",
        message: `${employee.firstName} ${employee.lastName} submitted a ${leaveType.name} leave request for ${totalDays} day(s).`,
        actionUrl: `/leave`,
      });
    } else {
      /**
       * If no manager exists, notify organization admins.
       */
      const admins =
        await prisma.membership.findMany({
          where: {
            organizationId,
            role: {
              key: "ADMIN",
            },
          },
          select: {
            userId: true,
          },
        });

      if (admins.length > 0) {
        await Promise.all(
          admins.map((admin) =>
            createNotification({
              organizationId,
              userId: admin.userId,
              type: "LEAVE_REQUEST",
              title: "New Leave Request",
              message: `${employee.firstName} ${employee.lastName} submitted a ${leaveType.name} leave request for ${totalDays} day(s).`,
              actionUrl: `/leave`,
            })
          )
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Leave request created successfully",
      data: leaveRequest,
    });
  } catch (error) {
    console.error(
      "Create leave request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create leave request",
    });
  }
};

/**
 * Get leave requests
 */
export const getLeaveRequests = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.user!.organizationId;

    const {
      employeeId,
      status,
      leaveTypeId,
    } = req.query;

    const leaveRequests =
      await prisma.leaveRequest.findMany({
        where: {
          organizationId,

          ...(employeeId
            ? {
                employeeId: String(employeeId),
              }
            : {}),

          ...(status
            ? {
                status: String(status) as any,
              }
            : {}),

          ...(leaveTypeId
            ? {
                leaveTypeId: String(leaveTypeId),
              }
            : {}),
        },

        include: {
          employee: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              employeeCode: true,
              jobTitle: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          leaveType: {
            select: {
              id: true,
              name: true,
              code: true,
              daysPerYear: true,
              isPaid: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    return res.status(200).json({
      success: true,
      data: leaveRequests,
    });
  } catch (error) {
    console.error(
      "Get leave requests error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave requests",
    });
  }
};

/**
 * Get single leave request
 */
export const getLeaveRequestById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.user!.organizationId;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const leaveRequest =
      await prisma.leaveRequest.findFirst({
        where: {
          id,
          organizationId,
        },

        include: {
          employee: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
              employeeCode: true,
              jobTitle: true,
              employmentStatus: true,
              department: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },

          leaveType: true,
        },
      });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: leaveRequest,
    });
  } catch (error) {
    console.error(
      "Get leave request error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch leave request",
    });
  }
};

/**
 * Update leave request status
 *
 * Supported:
 * - APPROVED
 * - REJECTED
 * - CANCELLED
 */
export const updateLeaveRequestStatus = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.user!.organizationId;

    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const { status, rejectionReason } =
      req.body;

    const allowedStatuses = [
      "APPROVED",
      "REJECTED",
      "CANCELLED",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: APPROVED, REJECTED, CANCELLED",
      });
    }

    const existingRequest =
      await prisma.leaveRequest.findFirst({
        where: {
          id,
          organizationId,
        },

        include: {
          employee: {
            select: {
              id: true,
              userId: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },

          leaveType: true,
        },
      });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    if (existingRequest.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: `Leave request is already ${existingRequest.status.toLowerCase()}`,
      });
    }

    /**
     * APPROVED
     */
    if (status === "APPROVED") {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const updatedRequest =
              await tx.leaveRequest.update({
                where: {
                  id: existingRequest.id,
                },

                data: {
                  status: "APPROVED",
                  approvedById:
                    req.user!.userId,
                  approvedAt: new Date(),
                },

                include: {
                  employee: {
                    select: {
                      id: true,
                      userId: true,
                      firstName: true,
                      lastName: true,
                      email: true,
                    },
                  },

                  leaveType: true,
                },
              });

            /**
             * Update leave balance.
             */
            const year =
              existingRequest.startDate.getFullYear();

            const leaveBalance =
              await tx.leaveBalance.findFirst({
                where: {
                  employeeId:
                    existingRequest.employeeId,

                  leaveTypeId:
                    existingRequest.leaveTypeId,

                  year,

                  organizationId,
                },
              });

            if (leaveBalance) {
              const availableDays =
                leaveBalance.totalDays +
                leaveBalance.carriedForward -
                leaveBalance.usedDays;

              if (
                existingRequest.totalDays >
                availableDays
              ) {
                throw new Error(
                  `Insufficient leave balance. Available: ${availableDays} days`
                );
              }

              await tx.leaveBalance.update({
                where: {
                  id: leaveBalance.id,
                },

                data: {
                  usedDays: {
                    increment:
                      existingRequest.totalDays,
                  },
                },
              });
            }

            /**
             * Auto-update attendance records for the leave period
             */
            const currentDay = new Date(existingRequest.startDate);
            const lastDay = new Date(existingRequest.endDate);
            while (currentDay <= lastDay) {
              const dayStart = new Date(currentDay);
              dayStart.setHours(0, 0, 0, 0);

              const existingAtt = await tx.attendance.findFirst({
                where: {
                  employeeId: existingRequest.employeeId,
                  date: dayStart,
                },
              });

              if (existingAtt) {
                await tx.attendance.update({
                  where: { id: existingAtt.id },
                  data: {
                    status: "ON_LEAVE",
                    notes: `Approved Leave: ${existingRequest.leaveType.name}`,
                  },
                });
              } else {
                await tx.attendance.create({
                  data: {
                    organizationId,
                    employeeId: existingRequest.employeeId,
                    date: dayStart,
                    status: "ON_LEAVE",
                    notes: `Approved Leave: ${existingRequest.leaveType.name}`,
                  },
                });
              }

              currentDay.setDate(currentDay.getDate() + 1);
            }

            return updatedRequest;
          }
        );

      /**
       * STEP 15.5
       * Activity log for approval.
       */
      await createActivity({
        organizationId,
        userId: req.user!.userId,
        action: "APPROVED",
        entityType: "LEAVE_REQUEST",
        entityId: existingRequest.id,
        metadata: {
          employeeId:
            existingRequest.employeeId,

          employeeName: `${existingRequest.employee.firstName} ${existingRequest.employee.lastName}`,

          leaveType:
            existingRequest.leaveType.name,

          totalDays:
            existingRequest.totalDays,
        },
      });

      /**
       * Notify employee.
       */
      await createNotification({
        organizationId,
        userId: existingRequest.employee.userId,
        type: "LEAVE_APPROVED",
        title: "Leave Request Approved",
        message: `Your ${existingRequest.leaveType.name} leave request for ${existingRequest.totalDays} day(s) has been approved.`,
        actionUrl: `/leave`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Leave request approved successfully",
        data: result,
      });
    }

    /**
     * REJECTED
     */
    if (status === "REJECTED") {
      if (
        !rejectionReason ||
        !String(rejectionReason).trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "rejectionReason is required when rejecting a leave request",
        });
      }

      const updatedRequest =
        await prisma.leaveRequest.update({
          where: {
            id: existingRequest.id,
          },

          data: {
            status: "REJECTED",
            rejectionReason:
              String(rejectionReason).trim(),
          },

          include: {
            employee: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            leaveType: true,
          },
        });

      /**
       * STEP 15.5
       * Activity log for rejection.
       */
      await createActivity({
        organizationId,
        userId: req.user!.userId,
        action: "REJECTED",
        entityType: "LEAVE_REQUEST",
        entityId: existingRequest.id,
        metadata: {
          employeeId:
            existingRequest.employeeId,

          employeeName: `${existingRequest.employee.firstName} ${existingRequest.employee.lastName}`,

          leaveType:
            existingRequest.leaveType.name,

          totalDays:
            existingRequest.totalDays,

          rejectionReason:
            String(rejectionReason).trim(),
        },
      });

      /**
       * Notify employee.
       */
      await createNotification({
        organizationId,
        userId: existingRequest.employee.userId,
        type: "LEAVE_REJECTED",
        title: "Leave Request Rejected",
        message: `Your ${existingRequest.leaveType.name} leave request has been rejected.`,
        actionUrl: `/leave`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Leave request rejected successfully",
        data: updatedRequest,
      });
    }

    /**
     * CANCELLED
     *
     * There is no LEAVE_CANCELLED enum in the
     * current NotificationType schema, so we use
     * SYSTEM for the notification.
     */
    if (status === "CANCELLED") {
      const updatedRequest =
        await prisma.leaveRequest.update({
          where: {
            id: existingRequest.id,
          },

          data: {
            status: "CANCELLED",
          },

          include: {
            employee: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },

            leaveType: true,
          },
        });

      /**
       * STEP 15.5
       * Activity log for cancellation.
       */
      await createActivity({
        organizationId,
        userId: req.user!.userId,
        action: "CANCELLED",
        entityType: "LEAVE_REQUEST",
        entityId: existingRequest.id,
        metadata: {
          employeeId:
            existingRequest.employeeId,

          employeeName: `${existingRequest.employee.firstName} ${existingRequest.employee.lastName}`,

          leaveType:
            existingRequest.leaveType.name,

          totalDays:
            existingRequest.totalDays,
        },
      });

      /**
       * Notify employee.
       */
      await createNotification({
        organizationId,
        userId: existingRequest.employee.userId,
        type: "SYSTEM",
        title: "Leave Request Cancelled",
        message: `Your ${existingRequest.leaveType.name} leave request has been cancelled.`,
        actionUrl: `/leave`,
      });

      return res.status(200).json({
        success: true,
        message:
          "Leave request cancelled successfully",
        data: updatedRequest,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Unable to update leave request",
    });
  } catch (error: any) {
    console.error(
      "Update leave request status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to update leave request",
    });
  }
};

/**
 * Get leave balances for an employee
 */
export const getEmployeeLeaveBalances = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.user!.organizationId;

    const employeeId = Array.isArray(req.params.employeeId)
      ? req.params.employeeId[0]
      : req.params.employeeId;

    const employee =
      await prisma.employee.findFirst({
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

    const year = Number(
      req.query.year ||
        new Date().getFullYear()
    );

    const balances =
      await prisma.leaveBalance.findMany({
        where: {
          employeeId,
          year,
          organizationId,
        },

        include: {
          leaveType: {
            select: {
              id: true,
              name: true,
              code: true,
              daysPerYear: true,
              carryForward: true,
              isPaid: true,
            },
          },
        },

        orderBy: {
          leaveType: {
            name: "asc",
          },
        },
      });

    return res.status(200).json({
      success: true,
      data: balances,
    });
  } catch (error) {
    console.error(
      "Get employee leave balances error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch leave balances",
    });
  }
};

/**
 * Create / update employee leave balance
 */
export const upsertLeaveBalance = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.user!.organizationId;

    const {
      employeeId,
      leaveTypeId,
      year,
      totalDays,
      carriedForward,
    } = req.body;

    if (
      !employeeId ||
      !leaveTypeId ||
      !year ||
      totalDays === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "employeeId, leaveTypeId, year and totalDays are required",
      });
    }

    const employee =
      await prisma.employee.findFirst({
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

    const leaveType =
      await prisma.leaveType.findFirst({
        where: {
          id: leaveTypeId,
          organizationId,
        },
      });

    if (!leaveType) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    const balance =
      await prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId,
            leaveTypeId,
            year: Number(year),
          },
        },

        create: {
          employeeId,
          leaveTypeId,
          year: Number(year),
          totalDays: Number(totalDays),
          carriedForward:
            Number(carriedForward || 0),
          usedDays: 0,
          organizationId,
        } as any,

        update: {
          totalDays: Number(totalDays),
          carriedForward:
            Number(carriedForward || 0),
          organizationId,
        } as any,

        include: {
          leaveType: true,
        },
      });

    return res.status(200).json({
      success: true,
      message:
        "Leave balance saved successfully",
      data: balance,
    });
  } catch (error) {
    console.error(
      "Upsert leave balance error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to save leave balance",
    });
  }
};
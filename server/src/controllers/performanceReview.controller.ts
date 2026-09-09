import { Response } from "express";
import { z } from "zod";
import { prisma } from "../config/prisma";
import { AuthenticatedRequest } from "../types/auth";

const createReviewSchema = z.object({
  employeeId: z.string().min(1),
  reviewerId: z.string().min(1),
  cycle: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  overallScore: z.number().min(0).max(5).optional(),
  overallRating: z.number().min(0).max(5).optional(),
  technicalRating: z.number().min(0).max(5).optional(),
  communicationRating: z.number().min(0).max(5).optional(),
  teamworkRating: z.number().min(0).max(5).optional(),
  leadershipRating: z.number().min(0).max(5).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  comments: z.string().optional(),
  reviewDate: z.coerce.date().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "COMPLETED", "ACKNOWLEDGED"]).optional(),
});

const updateReviewSchema = z.object({
  cycle: z.string().optional(),
  periodStart: z.string().optional(),
  periodEnd: z.string().optional(),
  overallScore: z.number().min(0).max(5).optional(),
  overallRating: z.number().min(0).max(5).optional(),
  technicalRating: z.number().min(0).max(5).optional(),
  communicationRating: z.number().min(0).max(5).optional(),
  leadershipRating: z.number().min(0).max(5).optional(),
  strengths: z.string().optional(),
  improvements: z.string().optional(),
  comments: z.string().optional(),
  reviewDate: z.coerce.date().optional(),
  status: z.enum(["DRAFT", "SUBMITTED", "COMPLETED", "ACKNOWLEDGED"]).optional(),
});

/*
|--------------------------------------------------------------------------
| Get all reviews
|--------------------------------------------------------------------------
*/

export const getPerformanceReviews = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const {
      employeeId,
      reviewerId,
      status,
      page = "1",
      limit = "20",
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (pageNumber - 1) * limitNumber;

    const where: any = {
      organizationId,
    };

    if (typeof employeeId === "string") {
      where.employeeId = employeeId;
    }

    if (typeof reviewerId === "string") {
      where.reviewerId = reviewerId;
    }

    if (
      typeof status === "string" &&
      ["DRAFT", "SUBMITTED", "COMPLETED", "ACKNOWLEDGED"].includes(status)
    ) {
      where.status = status === "ACKNOWLEDGED" ? "COMPLETED" : status;
    }

    const [reviews, total] = await Promise.all([
      prisma.performanceReview.findMany({
        where,
        skip,
        take: limitNumber,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          employee: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              jobTitle: true,
            },
          },
          reviewer: {
            select: {
              id: true,
              employeeCode: true,
              firstName: true,
              lastName: true,
              jobTitle: true,
            },
          },
        },
      }),

      prisma.performanceReview.count({
        where,
      }),
    ]);

    const formattedReviews = reviews.map((r) => ({
      ...r,
      overallRating: r.overallScore ?? 0,
      periodStart: r.reviewDate || r.createdAt,
      periodEnd: r.reviewDate || r.createdAt,
    }));

    return res.status(200).json({
      success: true,
      data: formattedReviews,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.ceil(total / limitNumber),
      },
    });
  } catch (error) {
    console.error("Get performance reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch performance reviews",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Get single review
|--------------------------------------------------------------------------
*/

export const getPerformanceReviewById = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const review = await prisma.performanceReview.findFirst({
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

        reviewer: {
          select: {
            id: true,
            employeeCode: true,
            firstName: true,
            lastName: true,
            jobTitle: true,
          },
        },
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Performance review not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...review,
        overallRating: review.overallScore ?? 0,
        periodStart: review.reviewDate || review.createdAt,
        periodEnd: review.reviewDate || review.createdAt,
      },
    });
  } catch (error) {
    console.error("Get performance review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch performance review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Create review
|--------------------------------------------------------------------------
*/

export const createPerformanceReview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;

    const parsed = createReviewSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review data",
        errors: parsed.error.flatten(),
      });
    }

    const data = parsed.data;

    const [employee, reviewer] = await Promise.all([
      prisma.employee.findFirst({
        where: {
          id: data.employeeId,
          organizationId,
        },
      }),

      prisma.employee.findFirst({
        where: {
          id: data.reviewerId,
          organizationId,
        },
      }),
    ]);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: "Reviewer not found",
      });
    }

    const cycle =
      data.cycle ||
      (data.periodStart && data.periodEnd
        ? `${new Date(data.periodStart).toLocaleDateString("en-US", { month: "short", year: "numeric" })} - ${new Date(data.periodEnd).toLocaleDateString("en-US", { month: "short", year: "numeric" })}`
        : `Review ${new Date().getFullYear()}`);

    const overallScore =
      data.overallScore ??
      data.overallRating ??
      (data.technicalRating !== undefined
        ? Number(
            (
              ((data.technicalRating || 3) +
                (data.communicationRating || 3) +
                (data.leadershipRating || 3)) /
              3
            ).toFixed(1)
          )
        : 3.5);

    const commentsCombined = [
      data.comments,
      data.strengths ? `Strengths: ${data.strengths}` : null,
      data.improvements ? `Areas for Improvement: ${data.improvements}` : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    const status =
      data.status === "ACKNOWLEDGED"
        ? "COMPLETED"
        : (data.status as any) || "DRAFT";

    const review = await prisma.performanceReview.create({
      data: {
        organizationId,
        employeeId: data.employeeId,
        reviewerId: data.reviewerId,
        cycle,
        overallScore,
        comments: commentsCombined || null,
        reviewDate: data.periodEnd ? new Date(data.periodEnd) : new Date(),
        status,
      },

      include: {
        employee: true,
        reviewer: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Performance review created successfully",
      data: {
        ...review,
        overallRating: review.overallScore ?? 0,
        periodStart: data.periodStart || review.createdAt,
        periodEnd: data.periodEnd || review.createdAt,
      },
    });
  } catch (error) {
    console.error("Create performance review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create performance review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Update review
|--------------------------------------------------------------------------
*/

export const updatePerformanceReview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const parsed = updateReviewSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid review data",
        errors: parsed.error.flatten(),
      });
    }

    const existingReview = await prisma.performanceReview.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!existingReview) {
      return res.status(404).json({
        success: false,
        message: "Performance review not found",
      });
    }

    if (existingReview.status === "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "A completed review cannot be modified",
      });
    }

    const data = parsed.data;
    const status =
      data.status === "ACKNOWLEDGED"
        ? "COMPLETED"
        : (data.status as any);

    const overallScore = data.overallScore ?? data.overallRating;

    const review = await prisma.performanceReview.update({
      where: {
        id,
      },
      data: {
        ...(data.cycle ? { cycle: data.cycle } : {}),
        ...(overallScore !== undefined ? { overallScore } : {}),
        ...(data.comments !== undefined ? { comments: data.comments } : {}),
        ...(data.reviewDate ? { reviewDate: data.reviewDate } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        employee: true,
        reviewer: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Performance review updated successfully",
      data: {
        ...review,
        overallRating: review.overallScore ?? 0,
        periodStart: review.reviewDate || review.createdAt,
        periodEnd: review.reviewDate || review.createdAt,
      },
    });
  } catch (error) {
    console.error("Update performance review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update performance review",
    });
  }
};

/*
|--------------------------------------------------------------------------
| Delete review
|--------------------------------------------------------------------------
*/

export const deletePerformanceReview = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    const review = await prisma.performanceReview.findFirst({
      where: {
        id,
        organizationId,
      },
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Performance review not found",
      });
    }

    if (review.status !== "DRAFT") {
      return res.status(400).json({
        success: false,
        message: "Only draft reviews can be deleted",
      });
    }

    await prisma.performanceReview.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Performance review deleted successfully",
    });
  } catch (error) {
    console.error("Delete performance review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete performance review",
    });
  }
};
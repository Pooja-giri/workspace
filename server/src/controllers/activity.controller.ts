import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import { getActivities } from "../services/activity.service";

export const getActivityLogs = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const organizationId =
      req.user!.organizationId;

    const {
      entityType,
      entityId,
      userId,
      limit,
    } = req.query;

    const activities = await getActivities(
      organizationId,
      {
        entityType: entityType
          ? String(entityType)
          : undefined,

        entityId: entityId
          ? String(entityId)
          : undefined,

        userId: userId
          ? String(userId)
          : undefined,

        limit: limit
          ? Number(limit)
          : 50,
      }
    );

    return res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error(
      "getActivityLogs error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch activity logs",
    });
  }
};
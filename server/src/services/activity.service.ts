import { prisma } from "../config/prisma";
import { Prisma } from "@prisma/client";

interface CreateActivityInput {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export const createActivity = async (
  data: CreateActivityInput
) => {
  return prisma.activityLog.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      metadata: data.metadata ? (data.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
    },
  });
};

export const getActivities = async (
  organizationId: string,
  options?: {
    entityType?: string;
    entityId?: string;
    userId?: string;
    limit?: number;
  }
) => {
  return prisma.activityLog.findMany({
    where: {
      organizationId,

      ...(options?.entityType
        ? {
            entityType: options.entityType,
          }
        : {}),

      ...(options?.entityId
        ? {
            entityId: options.entityId,
          }
        : {}),

      ...(options?.userId
        ? {
            userId: options.userId,
          }
        : {}),
    },

    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: Math.min(options?.limit ?? 50, 100),
  });
};
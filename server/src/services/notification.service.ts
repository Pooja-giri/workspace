import { prisma } from "../config/prisma";
import { NotificationType, Prisma } from "@prisma/client";

interface CreateNotificationInput {
  organizationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
}

export const createNotification = async (
  data: CreateNotificationInput
) => {
  return prisma.notification.create({
    data: {
      organizationId: data.organizationId,
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      actionUrl: data.actionUrl,
    },
  });
};

export const createNotifications = async (
  notifications: CreateNotificationInput[]
) => {
  if (!notifications.length) return;

  return prisma.notification.createMany({
    data: notifications.map((notification) => ({
      organizationId: notification.organizationId,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
    })),
  });
};

export const getUserNotifications = async (
  userId: string,
  organizationId: string,
  limit = 30
) => {
  return prisma.notification.findMany({
    where: {
      userId,
      organizationId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });
};

export const getUnreadNotificationCount = async (
  userId: string,
  organizationId: string
) => {
  return prisma.notification.count({
    where: {
      userId,
      organizationId,
      readAt: null,
    },
  });
};

export const markNotificationAsRead = async (
  notificationId: string,
  userId: string,
  organizationId: string
) => {
  return prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
      organizationId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
};

export const markAllNotificationsAsRead = async (
  userId: string,
  organizationId: string
) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      organizationId,
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });
};

export const deleteNotification = async (
  notificationId: string,
  userId: string,
  organizationId: string
) => {
  return prisma.notification.deleteMany({
    where: {
      id: notificationId,
      userId,
      organizationId,
    },
  });
};
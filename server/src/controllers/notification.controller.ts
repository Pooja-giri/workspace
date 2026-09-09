import { Response } from "express";
import { AuthenticatedRequest } from "../types/auth";
import {
  deleteNotification,
  getUnreadNotificationCount,
  getUserNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notification.service";

export const getNotifications = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    const limit = Number(req.query.limit) || 30;

    const notifications = await getUserNotifications(
      userId,
      organizationId,
      Math.min(limit, 100)
    );

    const unreadCount = await getUnreadNotificationCount(
      userId,
      organizationId
    );

    return res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
    });
  }
};

export const getUnreadCount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    const unreadCount = await getUnreadNotificationCount(
      userId,
      organizationId
    );

    return res.json({
      success: true,
      data: {
        unreadCount,
      },
    });
  } catch (error) {
    console.error("Get unread count error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unread notification count",
    });
  }
};

export const markAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await markNotificationAsRead(
      id,
      userId,
      organizationId
    );

    return res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Mark notification read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};

export const markAllAsRead = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;

    await markAllNotificationsAsRead(
      userId,
      organizationId
    );

    return res.json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error("Mark all notifications read error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark all notifications as read",
    });
  }
};

export const removeNotification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const userId = req.user!.userId;
    const organizationId = req.user!.organizationId;
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    await deleteNotification(
      id,
      userId,
      organizationId
    );

    return res.json({
      success: true,
      message: "Notification deleted",
    });
  } catch (error) {
    console.error("Delete notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete notification",
    });
  }
};
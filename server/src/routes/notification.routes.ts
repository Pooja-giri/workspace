import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  removeNotification,
} from "../controllers/notification.controller";

const router = Router();

router.use(authenticate);

router.get("/", getNotifications);

router.get("/unread-count", getUnreadCount);

router.patch("/:id/read", markAsRead);

router.patch("/read-all", markAllAsRead);

router.delete("/:id", removeNotification);

export default router;
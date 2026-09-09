import { Router } from "express";

import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  getAttendanceById,
  updateAttendance,
} from "../controllers/attendance.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getAttendance);

router.get("/:id", getAttendanceById);

router.post(
  "/",
  requireRoles("ADMIN", "HR", "MANAGER"),
  createAttendance
);

router.put(
  "/:id",
  requireRoles("ADMIN", "HR", "MANAGER"),
  updateAttendance
);

router.delete(
  "/:id",
  requireRoles("ADMIN", "HR"),
  deleteAttendance
);

export default router;
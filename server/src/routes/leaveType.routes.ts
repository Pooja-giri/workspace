import { Router } from "express";
import {
  createLeaveType,
  deleteLeaveType,
  getLeaveTypeById,
  getLeaveTypes,
  updateLeaveType,
} from "../controllers/leaveType.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getLeaveTypes);

router.get("/:id", getLeaveTypeById);

router.post(
  "/",
  requireRoles("ADMIN", "HR"),
  createLeaveType
);

router.put(
  "/:id",
  requireRoles("ADMIN", "HR"),
  updateLeaveType
);

router.delete(
  "/:id",
  requireRoles("ADMIN", "HR"),
  deleteLeaveType
);

export default router;
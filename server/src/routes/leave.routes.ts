import { Router } from "express";
import {
  createLeaveRequest,
  getLeaveRequestById,
  getLeaveRequests,
  updateLeaveRequestStatus,
} from "../controllers/leave.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getLeaveRequests);

router.get("/:id", getLeaveRequestById);

router.post("/", createLeaveRequest);

router.patch(
  "/:id/status",
  requireRoles("ADMIN", "HR", "MANAGER"),
  updateLeaveRequestStatus
);

export default router;
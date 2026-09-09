import { Router } from "express";

import {
  getEmployeeLeaveBalances,
  initializeEmployeeBalances,
} from "../controllers/leaveBalance.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/employee/:employeeId",
  getEmployeeLeaveBalances
);

router.post(
  "/employee/:employeeId/initialize",
  initializeEmployeeBalances
);

export default router;
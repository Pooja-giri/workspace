import { Router } from "express";

import {
  bulkUpdateEmployees,
  createEmployee,
  getEmployee,
  getEmployees,
  importEmployees,
  updateEmployee,
  updateEmployeeStatus,
} from "../controllers/employee.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getEmployees);

router.get("/:id", getEmployee);

router.post(
  "/",
  requireRoles("ADMIN", "HR"),
  createEmployee
);

router.post(
  "/bulk",
  requireRoles("ADMIN", "HR"),
  bulkUpdateEmployees
);

router.post(
  "/import",
  requireRoles("ADMIN", "HR"),
  importEmployees
);

router.put(
  "/:id",
  requireRoles("ADMIN", "HR"),
  updateEmployee
);

router.patch(
  "/:id/status",
  requireRoles("ADMIN", "HR"),
  updateEmployeeStatus
);

export default router;
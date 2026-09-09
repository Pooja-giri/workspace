import { Router } from "express";

import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  getDepartments,
  updateDepartment,
} from "../controllers/department.controller";

import { authenticate } from "../middleware/auth.middleware";
import { requireRoles } from "../middleware/role.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getDepartments);

router.get("/:id", getDepartment);

router.post(
  "/",
  requireRoles("ADMIN", "HR"),
  createDepartment
);

router.put(
  "/:id",
  requireRoles("ADMIN", "HR"),
  updateDepartment
);

router.delete(
  "/:id",
  requireRoles("ADMIN", "HR"),
  deleteDepartment
);

export default router;
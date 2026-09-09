import { Router } from "express";

import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goal.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getGoals);

router.get("/:id", getGoalById);

router.post("/", createGoal);

router.patch("/:id", updateGoal);

router.delete("/:id", deleteGoal);

export default router;
import { Router } from "express";

import {
  getPerformanceReviews,
  getPerformanceReviewById,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
} from "../controllers/performanceReview.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get(
  "/",
  getPerformanceReviews
);

router.get(
  "/:id",
  getPerformanceReviewById
);

router.post(
  "/",
  createPerformanceReview
);

router.patch(
  "/:id",
  updatePerformanceReview
);

router.delete(
  "/:id",
  deletePerformanceReview
);

export default router;
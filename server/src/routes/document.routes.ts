import { Router } from "express";

import {
  getDocuments,
  getDocumentById,
  createDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/document.controller";

import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getDocuments);

router.get("/:id", getDocumentById);

router.post("/", createDocument);

router.patch("/:id", updateDocument);

router.delete("/:id", deleteDocument);

export default router;
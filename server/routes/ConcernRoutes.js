import express from "express";
import {
  createConcern,
  deleteConcern,
  getConcernById,
  getConcerns,
  getConcernByControlNumber,
  updateConcern,
} from "../controllers/ConcernController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

// Public route - status check (no authentication required)
router.get("/control-number/:controlNumber", getConcernByControlNumber);

// Protected routes - require authentication
router.get("/", authMiddleware, getConcerns);
router.get("/:id", authMiddleware, getConcernById);
router.post("/", authMiddleware, createConcern);
router.put("/:id", authMiddleware, updateConcern);
router.delete("/:id", authMiddleware, deleteConcern);

export default router;


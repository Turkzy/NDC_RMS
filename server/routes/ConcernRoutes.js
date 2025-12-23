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
import { concernSubmissionLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/control-number/:controlNumber", getConcernByControlNumber);
router.post("/", concernSubmissionLimiter, createConcern); // Public concern submission with rate limiting

// Protected routes - require authentication
router.get("/", authMiddleware, getConcerns);
router.get("/:id", authMiddleware, getConcernById);
router.put("/:id", authMiddleware, updateConcern);
router.delete("/:id", authMiddleware, deleteConcern);

export default router;


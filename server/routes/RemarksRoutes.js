import express from "express";
import {
  createRemark,
  deleteRemark,
  getRemarksByConcern,
  updateRemark,
} from "../controllers/RemarksController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.get("/:concernId", authMiddleware, getRemarksByConcern);
router.post("/:concernId", authMiddleware, createRemark);
router.put("/:id", authMiddleware, updateRemark);
router.delete("/:id", authMiddleware, deleteRemark);

export default router;


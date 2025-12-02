import express from "express";
import {
  createRemark,
  deleteRemark,
  getRemarksByConcern,
  updateRemark,
} from "../controllers/RemarksController.js";

const router = express.Router();

router.get("/:concernId", getRemarksByConcern);
router.post("/:concernId", createRemark);
router.put("/:id", updateRemark);
router.delete("/:id", deleteRemark);

export default router;


import express from "express";
import { createGroup, deleteGroup, getGroup, updateGroup } from "../controllers/WorkgroupController.js"

const router = express.Router();

router.post("/create", createGroup)
router.get("/get", getGroup)
router.put("/update/:id", updateGroup)
router.delete("/delete/:id", deleteGroup)

export default router;
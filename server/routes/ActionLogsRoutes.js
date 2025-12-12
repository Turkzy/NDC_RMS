import express from "express";
import {createActionLogs, getAllActionsLogs, updateActionLog, deleteActionLog} from "../controllers/ActionLogsController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create-action-log", authMiddleware, createActionLogs);
router.get("/get-all-action-logs", authMiddleware, getAllActionsLogs);
router.put("/update-action-log/:id", authMiddleware, updateActionLog);
router.delete("/delete-action-log/:id", authMiddleware, deleteActionLog);

export default router;
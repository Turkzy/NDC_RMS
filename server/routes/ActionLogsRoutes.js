import express from "express";
import {createActionLogs, getAllActionsLogs, updateActionLog, deleteActionLog} from "../controllers/ActionLogsController.js";

const router = express.Router();

router.post("/create-action-log", createActionLogs);
router.get("/get-all-action-logs", getAllActionsLogs);
router.put("/update-action-log/:id", updateActionLog);
router.delete("/delete-action-log/:id", deleteActionLog);

export default router;
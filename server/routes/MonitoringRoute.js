import express from "express";
import { getMonitoringByMonthId } from "../controllers/MonitoringController.js";

const router = express.Router();

// Route to get monitoring data by monthId
router.get("/get/:monthId", getMonitoringByMonthId);

export default router;

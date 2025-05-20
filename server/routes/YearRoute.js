import express from "express";
import {
  createManualMonitoringRecord,
  createMonitoringAutoMonth,
  createYearWithMonths,
  deleteYearWithMonths,
  editMonitoring,
  editYearWithMonths,
  getAllMonitoring,
  getAllSoftMonitoring,
  getMonitoringByMonthId,
  getYearsWithMonth,
  softdeleteMonitoring,
} from "../controllers/YearController.js";

const router = express.Router();

//REQUEST
router.post("/create-request", createMonitoringAutoMonth);
router.get("/get-request/:monthId", getMonitoringByMonthId);
router.get("/get-all-request", getAllMonitoring);
router.put("/update-request/:id", editMonitoring);
router.get("/get-all-softrequest", getAllSoftMonitoring);

//SOFT
router.delete("/softdelete-request/:id", softdeleteMonitoring);

//MANUAL REQUEST FOR DATA ENTRY
router.post("/create-manual-request", createManualMonitoringRecord);

//YEAR
router.post("/create-year", createYearWithMonths);
router.get("/get-year", getYearsWithMonth);
router.put("/update-year/:id", editYearWithMonths);
router.delete("/delete-year/:id", deleteYearWithMonths);

export default router;

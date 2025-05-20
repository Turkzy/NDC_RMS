// MonthRoute.js
import express from "express";
import { getMonthsByYearId } from "../controllers/MonthController.js";

const router = express.Router();

router.get("/getByYear/:yearId", getMonthsByYearId);

export default router;
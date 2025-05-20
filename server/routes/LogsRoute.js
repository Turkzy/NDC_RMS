import express from "express";
import { createLog, getLogs } from "../controllers/LogsController.js"

const router = express.Router();

router.post("/create", createLog);
router.get("/get",getLogs);

export default router;
import express from "express";
import { createRequest, getRequests, updateRequest, deleteRequest } from "../controllers/RequestController.js";

const router = express.Router();

router.post("/create", createRequest);
router.get("/get", getRequests);
router.put("/update/:id", updateRequest);
router.delete("/delete/:id", deleteRequest);

export default router;

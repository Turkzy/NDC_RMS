import express from "express";
import { createConcern, getConcerns, updateConcern, deleteConcern } from "../controllers/ConcernController.js";

const router = express.Router();

router.post("/create", createConcern);
router.get("/get", getConcerns);
router.put("/update/:id", updateConcern);
router.delete("/delete/:id", deleteConcern)

export default router;

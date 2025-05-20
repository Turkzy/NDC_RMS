import express from "express";
import { createPersonnel, deletePersonnel, getPersonnel, updatePersonnel } from "../controllers/ItpersonnelController.js"

const router = express.Router();

router.post("/create", createPersonnel);
router.get("/get", getPersonnel);
router.put("/update/:id", updatePersonnel);
router.delete("/delete/:id", deletePersonnel);

export default router;

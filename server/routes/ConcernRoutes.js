import express from "express";
import {
  createConcern,
  deleteConcern,
  getConcernById,
  getConcerns,
  getConcernByControlNumber,
  updateConcern,
} from "../controllers/ConcernController.js";

const router = express.Router();

router.get("/", getConcerns);
router.get("/control-number/:controlNumber", getConcernByControlNumber);
router.get("/:id", getConcernById);
router.post("/", createConcern);
router.put("/:id", updateConcern);
router.delete("/:id", deleteConcern);

export default router;


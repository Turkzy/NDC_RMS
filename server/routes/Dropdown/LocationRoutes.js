import express from "express";
import { createLocation, getAllLocations, updateLocation, deleteLocation } from "../../controllers/Dropdown/LocationController.js";
import { authMiddleware } from "../../middleware/authmiddleware.js";

const router = express.Router();

router.post("/create-location", authMiddleware, createLocation);
router.get("/get-all-locations", getAllLocations);
router.put("/update-location/:id", authMiddleware, updateLocation);
router.delete("/delete-location/:id", authMiddleware, deleteLocation);

export default router;
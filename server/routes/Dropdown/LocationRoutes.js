import express from "express";
import { createLocation, getAllLocations, updateLocation, deleteLocation } from "../../controllers/Dropdown/LocationController.js";

const router = express.Router();

router.post("/create-location", createLocation);
router.get("/get-all-locations", getAllLocations);
router.put("/update-location/:id", updateLocation);
router.delete("/delete-location/:id", deleteLocation);

export default router;
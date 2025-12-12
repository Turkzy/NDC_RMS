import Location from "../../models/Dropdown/LocationModel.js";

// ==================== LOCATION CRUD OPERATIONS ====================

// CREATE NEW LOCATION
export const createLocation = async (req, res) => {
    const { locationName } = req.body;
    try {
        await Location.create({ locationName });
        res.status(201).json({ message: "Location created successfully" });
    } catch (error) {
        console.error("Create location error:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}

// READ ALL LOCATIONS
export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.findAll();
        res.status(200).json({ locations });
    } catch (error) {
        console.error("Get all locations error:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}

// UPDATE LOCATION
export const updateLocation = async (req, res) => {
    const { locationName } = req.body;
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }
        await location.update({ locationName }, { where: { id: req.params.id } });
        res.status(200).json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Update location error:", error);
        return res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}

// DELETE LOCATION
export const deleteLocation = async (req, res) => {
    try {
        const location = await Location.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ message: "Location not found" });
        }
        await location.destroy();
        res.status(200).json({ message: "Location deleted successfully" });
    } catch (error) {
        console.error("Delete location error:", error);
        return res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}
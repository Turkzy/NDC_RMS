import Location from "../../models/Dropdown/LocationModel.js";

// ==================== LOCATION CRUD OPERATIONS ====================

// CREATE NEW LOCATION
export const createLocation = async (req, res) => {
    const { locationName } = req.body;
    try {
        await Location.create({ locationName });
        res.status(201).json({ message: "Location created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// READ ALL LOCATIONS
export const getAllLocations = async (req, res) => {
    try {
        const locations = await Location.findAll();
        res.status(200).json({ locations });
    } catch (error) {
        res.status(500).json({ message: error.message });
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
        return res.status(500).json({ message: error.message || "Internal Server Error" });
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
        return res.status(500).json({ message: error.message || "Internal Server Error" });
    }
}
import Remark from "../models/Remarks/RemarksModel.js";
import Concern from "../models/ConcernModel.js";

export const getRemarksByConcern = async (req, res) => {
  try {
    const { concernId } = req.params;
    const remarks = await Remark.findAll({
      where: { concernId },
      order: [["createdAt", "ASC"]],
    });
    res.status(200).json(remarks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createRemark = async (req, res) => {
  try {
    const { concernId } = req.params;
    const { body, addedBy } = req.body;

    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Remark body is required" });
    }

    const concern = await Concern.findByPk(concernId);
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }

    const remark = await Remark.create({
      concernId,
      body: body.trim(),
      addedBy: addedBy || null,
      createdAt: new Date(),
      updatedAt: null,
    });

    res.status(201).json({ message: "Remark added successfully", remark });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateRemark = async (req, res) => {
  try {
    const { body, addedBy } = req.body; // optional: who updated it

    // Validate body
    if (!body || !body.trim()) {
      return res.status(400).json({ message: "Remark body is required" });
    }

    // Find existing remark
    const remark = await Remark.findByPk(req.params.id);
    if (!remark) {
      return res.status(404).json({ message: "Remark not found" });
    }

    // Update remark
    await remark.update({
      body: body.trim(),
      addedBy: addedBy || remark.addedBy, // keep old if not provided
      updatedAt: new Date(),
    });

    return res.status(200).json({ message: "Remark updated successfully", remark });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteRemark = async (req, res) => {
  try {
    const { id } = req.params;
    const remark = await Remark.findByPk(id);

    if (!remark) {
      return res.status(404).json({ message: "Remark not found" });
    }

    await remark.destroy();
    res.status(200).json({ message: "Remark deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


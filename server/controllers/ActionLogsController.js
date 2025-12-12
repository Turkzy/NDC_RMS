import ActionLogs from "../models/ActionLogsModel.js";
import fs from "fs";
import path from "path";

//===CRUD OPERATIONS===

//CREATE ACTION LOG
export const createActionLogs = async (req, res) => {
    const { action, details} = req.body;
    try {
        const actionLog = await ActionLogs.create({ action, details });
        res.status(201).json({ message: "Action log created successfully", actionLog });
    } catch (error) {
        console.error("Create action log error:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}

//GET ALL ACTION LOGS
export const getAllActionsLogs = async (req, res) => {
    try {
        const actionLogs = await ActionLogs.findAll();
        res.status(200).json({ actionLogs });
    } catch (error) {
        console.error("Get all actions logs error:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
}

//UPDATE ACTION LOG
export const updateActionLog = async (req, res) => {
    const { id } = req.params;
    const { action, details } = req.body;
    try {
        const actionLog = await ActionLogs.findByPk(id);
        if (!actionLog) {
            return res.status(404).json({ message: "Action log not found" });
        }
        await actionLog.update({ action, details });
        res.status(200).json({ message: "Action log updated successfully", actionLog });
    } catch (error) {
        console.error("Update action log error:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
};

//DELETE ACTION LOG
export const deleteActionLog = async (req, res) => {
    const { id } = req.params;
    try {
        const actionLog = await ActionLogs.findByPk(id);
        if (!actionLog) {
            return res.status(404).json({ message: "Action log not found" });
        }
        await actionLog.destroy();
        res.status(200).json({ message: "Action log deleted successfully" });
    } catch (error) {
        console.error("Delete action log error:", error);
        res.status(500).json({ message: "An error occurred. Please try again later." });
    }
};

import Log from "../models/LogsModel.js";

// Create a new log entry
export const createLog = async (req, res) => {
    const { action, details, user } = req.body;

    try {
        await Log.create({ action, details, user });
        res.status(201).json({ message: "Log created successfully" });
    } catch (error) {
        console.error("Failed to create log:", error);
        res.status(500).json({ message: "Failed to create log", error });
    }
};

// Get the 10 most recent logs, delete older ones
export const getLogs = async (req, res) => {
    try {
        // Fetch all logs ordered by timestamp descending
        const logs = await Log.findAll({
            order: [['createdAt', 'DESC']]
        });

        // Delete logs beyond the 10 most recent
        if (logs.length > 50) {
            const excessLogs = logs.slice(50);
            const excessLogIds = excessLogs.map(log => log.id);

            await Log.destroy({
                where: {
                    id: excessLogIds
                }
            });
        }

        // Send only the latest 10 logs
        res.status(200).json(logs.slice(0, 50));
    } catch (error) {
        console.error("Failed to fetch logs:", error);
        res.status(500).json({ message: "Failed to fetch logs", error });
    }
};

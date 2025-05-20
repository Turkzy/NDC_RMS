import { DataTypes } from "sequelize";
import db from "../config/database.js"; // Make sure this exports a Sequelize instance

const Logs = db.define("Log", {
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false,
    }
}, {
    timestamps: true, // adds createdAt and updatedAt
});

export default Logs;

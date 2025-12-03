import { DataTypes } from "sequelize";
import db from "../config/database.js";

const ActionLogs = db.define("ActionLogs", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    details: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
},
{
    timestamps: true,
}
);

export default ActionLogs;
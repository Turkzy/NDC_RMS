import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const Role = db.define("Role", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Role;
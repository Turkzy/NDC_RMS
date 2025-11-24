import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const Location = db.define("Location", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    locationName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Location;
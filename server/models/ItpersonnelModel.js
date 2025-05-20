import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Personnel = db.define("Personnel", {
    personnels: { type: DataTypes.STRING,
        allowNull: false,
    },
});

export default Personnel;
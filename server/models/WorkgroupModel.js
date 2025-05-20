import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Workgroup = db.define("Workgroup", {
    workgroups: { type: DataTypes.STRING, allowNull: false}
})

export default Workgroup;
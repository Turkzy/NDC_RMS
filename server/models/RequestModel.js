import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Request = db.define("Request", {
    workgroup: { type: DataTypes.STRING, allowNull: false },
    requestedby: { type: DataTypes.STRING, allowNull: false },
    issue: { type: DataTypes.STRING, allowNull: false }
})

export default Request;
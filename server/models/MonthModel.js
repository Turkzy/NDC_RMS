import { DataTypes } from "sequelize";
import db from "../config/database.js"
import Monitoring from "./MonitoringModel.js";

const Month = db.define("Month", {
    month: { type: DataTypes.STRING, allowNull: false},
    yearId: { type: DataTypes.INTEGER, allowNull: false}
});

Month.hasMany(Monitoring, { foreignKey: "monthId", onDelete: "CASCADE"});
Monitoring.belongsTo(Month, { foreignKey: "monthId"});

export default Month;
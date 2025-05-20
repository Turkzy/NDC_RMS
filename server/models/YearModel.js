import { DataTypes } from "sequelize";
import db from "../config/database.js"
import Month from "./MonthModel.js";

const Year = db.define("Year", {
    year: { type: DataTypes.INTEGER , allowNull: false, unique: true },
});

Year.hasMany(Month, {foreignKey: "yearId", onDelete: 'CASCADE'});
Month.belongsTo(Year, {foreignKey: "yearId"})

export default Year;
import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Concern = db.define(
  "Concern",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    item: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    location: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endUser: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reportedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    levelOfRepair: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    controlNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Pending",
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    updatedAt: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    year: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    month: {
      type: DataTypes.TEXT,
      allowNull: false,
    }
  },
  {
    timestamps: false,
  }
);

export default Concern;

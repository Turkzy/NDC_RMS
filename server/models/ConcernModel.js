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
    description: {
      type: DataTypes.STRING,
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
    reportReceivedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    levelOfRepair: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deliveryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    controlNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    remarks: {
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
    taggedEmails: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    taggedUserIds: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
    updatedAt: { 
      type: DataTypes.DATE, 
      allowNull: false 
    },
  },
  {
    timestamps: false,
  }
);

export default Concern;

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
      allowNull: false,
    },
    reportedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reportReceivedBy: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    levelOfRepair: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    dateReceived: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    deliveryDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    targetDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    dateCompleted: {
      type: DataTypes.DATE,
      allowNull: true,
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
  },
  {
    timestamps: true,
  }
);

export default Concern;
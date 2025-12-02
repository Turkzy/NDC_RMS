import { DataTypes } from "sequelize";
import db from "../../config/database.js";
import Concern from "../ConcernModel.js";

const Remark = db.define(
  "Remark",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    concernId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Concern,
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    addedBy: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Remarks",
    timestamps: false,
  }
);

export default Remark;
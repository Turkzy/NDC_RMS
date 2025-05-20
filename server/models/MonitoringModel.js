  import { DataTypes } from "sequelize";
  import db from "../config/database.js";

  const Monitoring = db.define("Monitoring", {
    workgroup: { type: DataTypes.STRING, allowNull: false },
    requestedby: { type: DataTypes.STRING, allowNull: false },
    issue: { type: DataTypes.STRING, allowNull: false },
    controlno: { type: DataTypes.STRING, allowNull: false },
    serviceby: { type: DataTypes.STRING, allowNull: true},
    status: {
      type: DataTypes.STRING,
      allowNull: false, 
      defaultValue: "Pending",
    },
    repairDone: { type: DataTypes.STRING, allowNull: true },
    fileUrl: { type: DataTypes.STRING, allowNull: true},
    monthId: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false},
    updatedAt: { type: DataTypes.DATE, allowNull: false},
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  }, {
    paranoid: true,
    timestamps: false
  });

  export default Monitoring;

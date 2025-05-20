import { DataTypes } from "sequelize";
import db from "../config/database.js";

const Concern = db.define("Concern", {
  concerns: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Concern;

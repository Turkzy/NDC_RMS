import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Roles",
      key: "id",
    },
  },
});

User.associate = (models) => {
  User.belongsTo(models.Role, { foreignKey: "roleId", as: "role" });
};

export default User;
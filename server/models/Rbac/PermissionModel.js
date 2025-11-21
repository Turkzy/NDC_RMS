import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const Permission = db.define("Permission", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});

Permission.associate = (models) => {
    Permission.belongsToMany(models.Role, {
        through: models.RolePermission,
        foreignKey: "permissionId",
    });
};

export default Permission;
import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const RolePermission = db.define("RolePermission", {
    roleId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Roles",
            key: "id",
        },
    },
    permissionId: {
        type: DataTypes.INTEGER,
        references: {
            model: "Permissions",
            key: "id",
        },
    },
});

export default RolePermission;
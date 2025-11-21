import User from "../UserModel.js";
import Role from "./RoleModel.js";
import Permission from "./PermissionModel.js";
import RolePermission from "./RolePermissionModel.js";
import db from "../../config/database.js";

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
Role.belongsToMany(Permission, { through: RolePermission, foreignKey: "roleId", otherKey: "permissionId", as: "permissions" });
Permission.belongsToMany(Role, { through: RolePermission, foreignKey: "permissionId", otherKey: "roleId", as: "roles" });
Role.hasMany(RolePermission, { foreignKey: "roleId" })
Permission.hasMany(RolePermission, { foreignKey: "permissionId" })
RolePermission.belongsTo(Role, { foreignKey: "roleId", as: "role" });
RolePermission.belongsTo(Permission, { foreignKey: "permissionId", as: "permission" });

db.sync();

export { User, Role, Permission, RolePermission };
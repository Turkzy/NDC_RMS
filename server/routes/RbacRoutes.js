import express from "express";
import {
  createRole,
  createPermission,
  assignPermissionToRole,
  checkUserPermission,
  getAllRoles,
  getAllPermissions, removePermissionFromRole, getAllRolePermissions
} from "../controllers/RbacController.js";


const router = express.Router();

router.post("/role-permissions/assign", assignPermissionToRole);
router.delete("/role-permission/remove", removePermissionFromRole);
router.get("/role-permissions", getAllRolePermissions);

router.post("/roles", createRole);
router.get("/get-roles", getAllRoles);

router.post("/permissions", createPermission);
router.get("/get-permissions", getAllPermissions);

// General route for permission checking
router.post("/check-permission", checkUserPermission);

export default router;
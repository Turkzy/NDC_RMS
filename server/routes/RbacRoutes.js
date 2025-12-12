import express from "express";
import {
  createRole,
  createPermission,
  assignPermissionToRole,
  checkUserPermission,
  getAllRoles,
  getAllPermissions, removePermissionFromRole, getAllRolePermissions
} from "../controllers/RbacController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";


const router = express.Router();

router.post("/role-permissions/assign", authMiddleware, assignPermissionToRole);
router.delete("/role-permission/remove", authMiddleware, removePermissionFromRole);
router.get("/role-permissions", authMiddleware, getAllRolePermissions);

router.post("/roles", authMiddleware, createRole);
router.get("/get-roles", authMiddleware, getAllRoles);

router.post("/permissions", authMiddleware, createPermission);
router.get("/get-permissions", authMiddleware, getAllPermissions);

// General route for permission checking
router.post("/check-permission", authMiddleware, checkUserPermission);

export default router;
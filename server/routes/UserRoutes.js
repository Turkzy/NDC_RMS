import express from "express";
import {
  createAccount,
  deleteUser,
  getAllUsers,
  login,
  logout,
  updateUser,
  verifyAuth,
} from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimiter.js";
import {
  passwordValidationRules,
  handleValidationErrors,
  optionalPasswordValidationRules,
} from "../middleware/passwordValidation.js";

const router = express.Router();

router.post(
  "/create-account",
  registerLimiter,
  passwordValidationRules,
  handleValidationErrors,
  createAccount
);
router.post("/login", loginLimiter, login);
router.post("/logout", logout);
router.get("/verify", authMiddleware, verifyAuth);

//CRUD
router.get("/get-users", authMiddleware, getAllUsers);
router.put(
  "/update-user/:id",
  authMiddleware,
  optionalPasswordValidationRules,
  handleValidationErrors,
  updateUser
);
router.delete("/delete-user/:id", authMiddleware, deleteUser);

export default router;

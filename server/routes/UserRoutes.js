import express from "express";
import { createAccount, deleteUser, getAllUsers, login, logout, updateUser, verifyAuth } from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import { loginLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/create-account", createAccount)
router.post("/login", loginLimiter, login)
router.post("/logout", logout)
router.get("/verify", authMiddleware, verifyAuth)

//CRUD
router.get("/get-users", authMiddleware, getAllUsers)
router.put("/update-user/:id", authMiddleware, updateUser)
router.delete("/delete-user/:id", authMiddleware, deleteUser)

export default router;
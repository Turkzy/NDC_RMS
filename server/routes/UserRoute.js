import express from "express";
import {
  addUser,
  createAccount,
  deleteUser,
  getAllUsers,
  getUserById,
  login,
  updateUser,
} from "../controllers/UserController.js";

const router = express.Router();

router.post("/create-account", createAccount);
router.post("/login", login);

// CRUD
router.post("/add-user", addUser);
router.get("/get-users", getAllUsers);
router.get("/get/:id", getUserById);
router.put("/update-user/:id", updateUser);
router.delete("/delete-user/:id", deleteUser);

export default router;
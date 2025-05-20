import express from "express";
import { addUser, createAccount, deleteUser, editUser, getAllUsers, login } from "../controllers/UserController.js";


const router = express.Router();

router.post("/create-account", createAccount)
router.post("/login", login)

//CRUD
router.post("/add-user", addUser)
router.get("/all-users", getAllUsers)
router.put("/update-user/:id", editUser)
router.delete("/delete-user/:id", deleteUser)

export default router;
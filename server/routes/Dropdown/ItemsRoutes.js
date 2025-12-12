import express from "express";
import {
  createItemsCode,
  getAllItemsCode,
  getItemsCodeById,
  updateItemsCode,
  deleteItemsCode,
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
} from "../../controllers/Dropdown/ItemsController.js";
import { authMiddleware } from "../../middleware/authmiddleware.js";

const router = express.Router();

//ITEMS CODE ROUTES
router.post("/create-items-code", authMiddleware, createItemsCode);
router.get("/get-all-items-code", authMiddleware, getAllItemsCode);
router.get("/get-items-code-by-id/:id", authMiddleware, getItemsCodeById);
router.put("/update-items-code/:id", authMiddleware, updateItemsCode);
router.delete("/delete-items-code/:id", authMiddleware, deleteItemsCode);

//ITEMS ROUTES
router.post("/create-item", authMiddleware, createItem);
router.get("/get-all-items", getAllItems);
router.get("/get-item-by-id/:id", getItemById);
router.put("/update-item/:id", authMiddleware, updateItem);
router.delete("/delete-item/:id", authMiddleware, deleteItem);

export default router;

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

const router = express.Router();

//ITEMS CODE ROUTES
router.post("/create-items-code", createItemsCode);
router.get("/get-all-items-code", getAllItemsCode);
router.get("/get-items-code-by-id/:id", getItemsCodeById);
router.put("/update-items-code/:id", updateItemsCode);
router.delete("/delete-items-code/:id", deleteItemsCode);

//ITEMS ROUTES
router.post("/create-item", createItem);
router.get("/get-all-items", getAllItems);
router.get("/get-item-by-id/:id", getItemById);
router.put("/update-item/:id", updateItem);
router.delete("/delete-item/:id", deleteItem);

export default router;

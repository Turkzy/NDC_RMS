import { Items, ItemsCode } from "../../models/Dropdown/ItemsIndex.js";
import { Op } from "sequelize";

// ==================== ITEMS CODE CRUD OPERATIONS ====================

// CREATE NEW ITEMS CODE
export const createItemsCode = async (req, res) => {
    try {
        const { itemCode } = req.body;

        // Validate input
        if (!itemCode) {
            return res.status(400).json({ 
                error: true, 
                message: "itemCode is required" 
            });
        }

        // Validate that item code contains only letters (no numbers)
        if (!/^[A-Za-z]+$/.test(itemCode)) {
            return res.status(400).json({ 
                error: true, 
                message: "Item code must contain only letters (A-Z, a-z). Numbers are not allowed." 
            });
        }

        // Check if itemCode already exists
        const existingCode = await ItemsCode.findOne({ 
            where: { itemCode } 
        });
        if (existingCode) {
            return res.status(400).json({ 
                error: true, 
                message: "Item code already exists" 
            });
        }

        // Create new item code
        const newItemsCode = await ItemsCode.create({ itemCode });

        return res.status(201).json({
            error: false,
            message: "Item code created successfully",
            data: newItemsCode
        });
    } catch (error) {
        console.error("Create items code error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// READ ALL ITEMS CODE
export const getAllItemsCode = async (req, res) => {
    try {
        const itemsCodes = await ItemsCode.findAll({
            order: [['id', 'ASC']]
        });

        return res.status(200).json({
            error: false,
            message: "Items codes retrieved successfully",
            data: itemsCodes
        });
    } catch (error) {
        console.error("Get all items code error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// READ ITEMS CODE BY ID
export const getItemsCodeById = async (req, res) => {
    try {
        const { id } = req.params;

        const itemsCode = await ItemsCode.findByPk(id, {
            include: [{
                model: Items,
                as: "items",
                attributes: ['id', 'itemName']
            }]
        });

        if (!itemsCode) {
            return res.status(404).json({ 
                error: true, 
                message: "Item code not found" 
            });
        }

        return res.status(200).json({
            error: false,
            message: "Item code retrieved successfully",
            data: itemsCode
        });
    } catch (error) {
        console.error("Get items code by id error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// UPDATE ITEMS CODE
export const updateItemsCode = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemCode } = req.body;

        // Validate input
        if (!itemCode) {
            return res.status(400).json({ 
                error: true, 
                message: "itemCode is required" 
            });
        }

        // Validate that item code contains only letters (no numbers)
        if (!/^[A-Za-z]+$/.test(itemCode)) {
            return res.status(400).json({ 
                error: true, 
                message: "Item code must contain only letters (A-Z, a-z). Numbers are not allowed." 
            });
        }

        // Find item code
        const itemsCode = await ItemsCode.findByPk(id);
        if (!itemsCode) {
            return res.status(404).json({ 
                error: true, 
                message: "Item code not found" 
            });
        }

        // Check if itemCode already exists (excluding current record)
        const existingCode = await ItemsCode.findOne({ 
            where: { 
                itemCode,
                id: { [Op.ne]: id }
            } 
        });
        if (existingCode) {
            return res.status(400).json({ 
                error: true, 
                message: "Item code already exists" 
            });
        }

        // Update item code
        await itemsCode.update({ itemCode });

        return res.status(200).json({
            error: false,
            message: "Item code updated successfully",
            data: itemsCode
        });
    } catch (error) {
        console.error("Update items code error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// DELETE ITEMS CODE
export const deleteItemsCode = async (req, res) => {
    try {
        const { id } = req.params;

        // Find item code
        const itemsCode = await ItemsCode.findByPk(id);
        if (!itemsCode) {
            return res.status(404).json({ 
                error: true, 
                message: "Item code not found" 
            });
        }

        // Check if there are items using this code
        const itemsCount = await Items.count({ 
            where: { itemId: id } 
        });
        if (itemsCount > 0) {
            return res.status(400).json({ 
                error: true, 
                message: `Cannot delete item code. There are ${itemsCount} item(s) using this code. Please delete or update those items first.` 
            });
        }

        // Delete item code
        await itemsCode.destroy();

        return res.status(200).json({
            error: false,
            message: "Item code deleted successfully"
        });
    } catch (error) {
        console.error("Delete items code error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// ==================== ITEMS CRUD OPERATIONS ====================

// CREATE NEW ITEM
export const createItem = async (req, res) => {
    try {
        const { itemName, itemId } = req.body;

        // Validate input
        if (!itemName || !itemId) {
            return res.status(400).json({ 
                error: true, 
                message: "itemName and itemId are required" 
            });
        }

        // Validate that itemId exists in ItemsCode
        const itemsCode = await ItemsCode.findByPk(itemId);
        if (!itemsCode) {
            return res.status(400).json({ 
                error: true, 
                message: "Invalid itemId. Item code does not exist." 
            });
        }

        // Create new item
        const newItem = await Items.create({ itemName, itemId });

        // Fetch with association
        const itemWithCode = await Items.findByPk(newItem.id, {
            include: [{
                model: ItemsCode,
                as: "itemCode",
                attributes: ['id', 'itemCode']
            }]
        });

        return res.status(201).json({
            error: false,
            message: "Item created successfully",
            data: itemWithCode
        });
    } catch (error) {
        console.error("Create item error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// READ ALL ITEMS
export const getAllItems = async (req, res) => {
    try {
        const items = await Items.findAll({
            include: [{
                model: ItemsCode,
                as: "itemCode",
                attributes: ['id', 'itemCode']
            }],
            order: [['id', 'ASC']]
        });

        return res.status(200).json({
            error: false,
            message: "Items retrieved successfully",
            data: items
        });
    } catch (error) {
        console.error("Get all items error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// READ ITEM BY ID
export const getItemById = async (req, res) => {
    try {
        const { id } = req.params;

        const item = await Items.findByPk(id, {
            include: [{
                model: ItemsCode,
                as: "itemCode",
                attributes: ['id', 'itemCode']
            }]
        });

        if (!item) {
            return res.status(404).json({ 
                error: true, 
                message: "Item not found" 
            });
        }

        return res.status(200).json({
            error: false,
            message: "Item retrieved successfully",
            data: item
        });
    } catch (error) {
        console.error("Get item by id error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// UPDATE ITEM
export const updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { itemName, itemId } = req.body;

        // Find item
        const item = await Items.findByPk(id);
        if (!item) {
            return res.status(404).json({ 
                error: true, 
                message: "Item not found" 
            });
        }

        // Prepare update data
        const updateData = {};
        if (itemName !== undefined) {
            if (!itemName) {
                return res.status(400).json({ 
                    error: true, 
                    message: "itemName cannot be empty" 
                });
            }
            updateData.itemName = itemName;
        }
        if (itemId !== undefined) {
            // Validate that itemId exists in ItemsCode
            const itemsCode = await ItemsCode.findByPk(itemId);
            if (!itemsCode) {
                return res.status(400).json({ 
                    error: true, 
                    message: "Invalid itemId. Item code does not exist." 
                });
            }
            updateData.itemId = itemId;
        }

        // Update item
        await item.update(updateData);

        // Fetch updated item with association
        const updatedItem = await Items.findByPk(id, {
            include: [{
                model: ItemsCode,
                as: "itemCode",
                attributes: ['id', 'itemCode']
            }]
        });

        return res.status(200).json({
            error: false,
            message: "Item updated successfully",
            data: updatedItem
        });
    } catch (error) {
        console.error("Update item error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};

// DELETE ITEM
export const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Find item
        const item = await Items.findByPk(id);
        if (!item) {
            return res.status(404).json({ 
                error: true, 
                message: "Item not found" 
            });
        }

        // Delete item
        await item.destroy();

        return res.status(200).json({
            error: false,
            message: "Item deleted successfully"
        });
    } catch (error) {
        console.error("Delete item error:", error);
        return res.status(500).json({ 
            error: true, 
            message: error.message || "Internal Server Error" 
        });
    }
};
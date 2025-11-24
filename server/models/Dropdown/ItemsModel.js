import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const Items = db.define("Item", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    itemName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    itemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "ItemsCodes",
            key: "id",
        },
    },
});

export default Items;
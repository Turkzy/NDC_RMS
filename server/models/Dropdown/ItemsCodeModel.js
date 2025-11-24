import { DataTypes } from "sequelize";
import db from "../../config/database.js";

const ItemsCode = db.define("ItemsCode", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    itemCode: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});

export default ItemsCode;
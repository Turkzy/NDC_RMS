import Items from "./ItemsModel.js";
import ItemsCode from "./ItemsCodeModel.js";
import db from "../../config/database.js"

Items.belongsTo(ItemsCode, { foreignKey: "itemId", as: "itemCode" });
ItemsCode.hasMany(Items, { foreignKey: "itemId", as: "items" });

db.sync();

export { Items, ItemsCode };


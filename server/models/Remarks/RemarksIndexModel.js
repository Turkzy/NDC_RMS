import Remark from "./RemarksModel.js";
import Concern from "../ConcernModel.js";

Concern.hasMany(Remark, { foreignKey: "concernId", as: "remarks" });
Remark.belongsTo(Concern, { foreignKey: "concernId", as: "concern" });

export { Remark, Concern };
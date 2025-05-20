import { DataTypes } from "sequelize";
import db from "../config/database.js";

const User = db.define("User", { 
    firstname: { type: DataTypes.STRING, allowNull: true},
    lastname: { type: DataTypes.STRING, allowNull: true},
    email: { type: DataTypes.STRING, allowNull: false, unique: true},
    username: { type: DataTypes.STRING, allowNull: false},
    mobile: { type: DataTypes.STRING, allowNull: true},
    password: { type: DataTypes.STRING, allowNull: false},
})

export default User;
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js"

//CREATE NEW ACCOUNT
export const createAccount = async (req, res) => {
    try {
        const { firstname, lastname, mobile, email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: true, message: "All fields are required" });
        }

        const isUser = await User.findOne({ where: { email } });
        if (isUser) {
            return res.status(400).json({ error: true, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            firstname: firstname || null,
            lastname: lastname || null, 
            mobile: mobile || null, email, password: hashedPassword });

        const accessToken = jwt.sign({ userId: newUser.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });

        return res.status(201).json({
            error: false,
            user: { email: newUser.email },
            accessToken,
            message: "Registration Successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: true, message: "Email and password are required" });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ error: true, message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ error: true, message: "Invalid password" });
        }

        const accessToken = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "30m" }
        );

        return res.json({
            error: false,
            user: { name: user.name, email: user.email, username: user.username},
            accessToken,
            message: "Login Successful",
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

// GET/READ ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        return res.status(200).json({ error: false, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const addUser = async (req, res) => {
    try {
        const { firstname, lastname, mobile, email, password, username} = req.body;

        if ( !email || !password) {
            return res.status(400).json({ error: true, message: "All fields are required" });
        }

        if (!email.includes("@")) {
            return res.status(400).json({ error: true, message: "Invalid email format" });
        }

        const isUser = await User.findOne({ where: { email } });
        if (isUser) {
            return res.status(400).json({ error: true, message: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ 
            firstname: firstname || null,
            lastname: lastname || null, 
            mobile: mobile || null, email, password: hashedPassword, username });

        return res.status(201).json({ error: false, message: "User added successfully", user: newUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const editUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstname, lastname, mobile, email, password, username } = req.body;

        const updateData = { firstname, lastname, mobile, email, username };

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const [updated] = await User.update(updateData, {
            where: { id },
        });

        if (!updated) {
            return res.status(404).json({ error: true, message: "User not found or not updated" });
        }

        const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password'] } });

        return res.status(200).json({ error: false, message: "User updated successfully", user: updatedUser });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await User.destroy({ where: { id } });

        if (!deleted) {
            return res.status(404).json({ error: true, message: "User not found" });
        }

        return res.status(200).json({ error: false, message: "User deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: "Internal Server Error" });
    }
};
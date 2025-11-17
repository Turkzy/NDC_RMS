import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

// CREATE NEW ACCOUNT (Self-registration)
export const createAccount = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: true, message: "Email, password, and username are required" });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }

    // Check if user exists
    const isEmailTaken = await User.findOne({ where: { email } });
    if (isEmailTaken) {
      return res.status(400).json({ error: true, message: "Email already in use" });
    }

    const isUsernameTaken = await User.findOne({ where: { username } });
    if (isUsernameTaken) {
      return res.status(400).json({ error: true, message: "Username already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({ email, password: hashedPassword, username });

    // Generate JWT with expiration (24 hours default, configurable via env)
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, username: newUser.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );

    return res.status(201).json({
      error: false,
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
      accessToken,
      message: "Registration successful",
    });
  } catch (error) {
    console.error("Create account error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: true, message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: true, message: "User not found" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: true, message: "Invalid password" });
    }

    // Generate JWT with expiration (24 hours default, configurable via env)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username },
      ACCESS_TOKEN_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );

    return res.status(200).json({
      error: false,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
      accessToken,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// GET ALL USERS (Admin-only, requires middleware)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
    });
    return res.status(200).json({ error: false, users });
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// ADD USER (Admin-only, requires middleware)
export const addUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !password || !username) {
      return res.status(400).json({ error: true, message: "Email, password, and username are required" });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: true, message: "Invalid email format" });
    }

    // Check if user exists
    const isEmailTaken = await User.findOne({ where: { email } });
    if (isEmailTaken) {
      return res.status(400).json({ error: true, message: "Email already in use" });
    }

    const isUsernameTaken = await User.findOne({ where: { username } });
    if (isUsernameTaken) {
      return res.status(400).json({ error: true, message: "Username already in use" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({ email, password: hashedPassword, username });

    return res.status(201).json({
      error: false,
      message: "User added successfully",
      user: { id: newUser.id, email: newUser.email, username: newUser.username },
    });
  } catch (error) {
    console.error("Add user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// UPDATE USER (Admin-only or self-update, requires middleware)
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password, username } = req.body;

    // Prepare update data
    const updateData = {};
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: true, message: "Invalid email format" });
      }
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail && existingEmail.id !== Number(id)) {
        return res.status(400).json({ error: true, message: "Email already in use" });
      }
      updateData.email = email;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }
    if (username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername && existingUsername.id !== Number(id)) {
        return res.status(400).json({ error: true, message: "Username already in use" });
      }
      updateData.username = username;
    }

    // Update user
    const [updated] = await User.update(updateData, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: true, message: "User not found or not updated" });
    }

    // Fetch updated user with role
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      error: false,
      message: "User updated successfully",
      user: { id: updatedUser.id, email: updatedUser.email, username: updatedUser.username },
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// DELETE USER (Admin-only, requires middleware)
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.destroy({ where: { id } });

    if (!deleted) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    return res.status(200).json({ error: false, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
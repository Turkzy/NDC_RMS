import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import Role from "../models/Rbac/RoleModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

// CREATE NEW ACCOUNT (Self-registration)
export const createAccount = async (req, res) => {
  try {
    const { email, password, username, roleId } = req.body;

    // Validate input
    if (!email || !password || !username || !roleId) {
      return res.status(400).json({ error: true, message: "Email, password, username, and roleId are required" });
    }

    // Validate roleId
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ error: true, message: "Invalid roleId" });
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
    const newUser = await User.create({ email, password: hashedPassword, username, roleId });

    // Generate JWT with expiration (24 hours default, configurable via env)
    const accessToken = jwt.sign(
      { userId: newUser.id, email: newUser.email, username: newUser.username, roleId: newUser.roleId },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );

    // Set httpOnly cookie with token
const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';

    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isSecure, // Only send over HTTPS in production
      sameSite: 'strict', // CSRF protection
      maxAge: maxAge,
      path: '/',
    });

    return res.status(201).json({
      error: false,
      user: { id: newUser.id, email: newUser.email, username: newUser.username, roleId: newUser.roleId },
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
    
    // Validate password - use generic error message to prevent user enumeration
    let isPasswordValid = false;
    if (user) {
      isPasswordValid = await bcrypt.compare(password, user.password);
    }
    
    // Always return same generic message whether user exists or password is wrong
    if (!user || !isPasswordValid) {
      return res.status(400).json({ error: true, message: "Invalid email or password" });
    }

    // Generate JWT with expiration (24 hours default, configurable via env)
    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, username: user.username, roleId: user.roleId },
      JWT_SECRET,
      { expiresIn: process.env.TOKEN_EXPIRATION || '24h' }
    );

    const isSecure = process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';
    // Set httpOnly cookie with token
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    res.cookie('token', accessToken, {
      httpOnly: true,
      secure: isSecure, // Only send over HTTPS in production
      sameSite: 'strict', // CSRF protection
      maxAge: maxAge,
      path: '/',
    });

    return res.status(200).json({
      error: false,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        roleId: user.roleId,
      },
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

// VERIFY AUTHENTICATION (returns current user info if authenticated)
export const verifyAuth = async (req, res) => {
  try {
    // If we reach here, authMiddleware has already verified the token
    // Return the user info from the decoded token
    return res.status(200).json({
      error: false,
      user: {
        id: req.user.userId,
        email: req.user.email,
        username: req.user.username,
        roleId: req.user.roleId || null,
      },
      message: "Authentication verified",
    });
  } catch (error) {
    console.error("Verify auth error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};

// LOGOUT
export const logout = async (req, res) => {
  try {
    // Clear the httpOnly cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    return res.status(200).json({
      error: false,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
};
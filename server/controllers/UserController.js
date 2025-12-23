import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/UserModel.js";
import { fileTypeFromFile } from "file-type";
import path from "path";
import fs from "fs";
import crypto from "crypto";
const JWT_SECRET = process.env.JWT_SECRET;
const UPLOAD_DIR = path.resolve("public/userimages");
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5_000_000; // 5 MB

const ALLOWED_MIME_TYPES = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

const ALLOWED_FILE_TYPE_EXTENSIONS = ["jpg", "jpeg", "png"];

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

const saveUploadedFile = async (file) => {
  // 1. Validate file extension
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_FILE_TYPES.includes(ext)) {
    throw new Error("Invalid file format. Only JPG, JPEG, and PNG files are allowed.");
  }

  // 2. Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1_000_000}MB`);
  }

  // 3. Validate MIME type from uploaded file metadata
  if (file.mimetype) {
    const allowedMimes = ALLOWED_MIME_TYPES[ext];
    if (!allowedMimes || !allowedMimes.includes(file.mimetype)) {
      throw new Error(`Invalid MIME type. Expected ${allowedMimes?.join(" or ")}, got ${file.mimetype}`);
    }
  }

  ensureUploadDir();

  // 4. Generate secure filename with better collision prevention
  // Using crypto.randomUUID() for better uniqueness
  const uniqueId = crypto.randomUUID();
  const filename = `${Date.now()}-${uniqueId}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);

  // 5. Save file temporarily to verify actual content
  await file.mv(filePath);

  try {
    // 6. Verify actual file content using file-type library
    const fileType = await fileTypeFromFile(filePath);
    
    if (!fileType) {
      // Delete the file if we can't determine its type
      fs.unlinkSync(filePath);
      throw new Error("Unable to determine file type. File may be corrupted or invalid.");
    }

    const detectedExt = `.${fileType.ext}`.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(detectedExt)) {
      fs.unlinkSync(filePath);
      throw new Error(`File content does not match extension. Detected: ${fileType.mime}, Expected: image/jpeg or image/png`);
    }

    const expectedMimes = ALLOWED_MIME_TYPES[ext];
    if (!expectedMimes.includes(fileType.mime)) {
      fs.unlinkSync(filePath);
      throw new Error(`File content MIME type mismatch. Detected: ${fileType.mime}, Expected: ${expectedMimes.join(" or ")}`);
    }

    return filename;
  } catch (error) {
    // Clean up file if validation fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    // Re-throw the error with context
    if (error.message.includes("Unable to determine") || 
        error.message.includes("does not match") || 
        error.message.includes("MIME type mismatch")) {
      throw error;
    }
    throw new Error(`File validation failed: ${error.message}`);
  }
};

const deleteUploadedFile = (filename) => {
  if (!filename) return;
  const filePath = path.join(UPLOAD_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// CREATE NEW ACCOUNT (Self-registration)
export const createAccount = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Validate input
    if (!email || !username) {
      return res.status(400).json({ error: true, message: "Email and username are required" });
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
      user: { id: newUser.id, email: newUser.email, username: newUser.username, imageUrl: newUser.imageUrl },
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
      { userId: user.id, email: user.email, username: user.username },
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
        imageUrl: user.imageUrl,
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

    // Get current user to check for existing image
    const currentUser = await User.findByPk(id);
    if (!currentUser) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

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

    // Handle profile picture upload
    if (req.files && req.files.image) {
      try {
        const uploadedFilename = await saveUploadedFile(req.files.image);
        
        // Delete old profile picture if it exists
        if (currentUser.imageUrl) {
          deleteUploadedFile(currentUser.imageUrl);
        }
        
        updateData.imageUrl = uploadedFilename;
      } catch (fileError) {
        return res.status(400).json({ error: true, message: fileError.message });
      }
    }

    // Update user
    const [updated] = await User.update(updateData, { where: { id } });
    if (!updated) {
      return res.status(404).json({ error: true, message: "User not found or not updated" });
    }

    // Fetch updated user
    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
    });

    return res.status(200).json({
      error: false,
      message: "User updated successfully",
      user: { 
        id: updatedUser.id, 
        email: updatedUser.email, 
        username: updatedUser.username,
        imageUrl: updatedUser.imageUrl 
      },
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
    // Fetch full user data to get imageUrl
    const fullUser = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });
    
    return res.status(200).json({
      error: false,
      user: {
        id: fullUser.id,
        email: fullUser.email,
        username: fullUser.username,
        imageUrl: fullUser.imageUrl,
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
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileTypeFromFile } from "file-type";
import Concern from "../models/ConcernModel.js";
import { Remark } from "../models/Remarks/RemarksIndexModel.js";
import { Items, ItemsCode } from "../models/Dropdown/ItemsIndex.js";
import { Op } from "sequelize";

const UPLOAD_DIR = path.resolve("public/concernfiles");
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5_000_000; // 5 MB

// MIME type whitelist - maps extensions to allowed MIME types
const ALLOWED_MIME_TYPES = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
};

// File type mapping for file-type library
const ALLOWED_FILE_TYPE_EXTENSIONS = ["jpg", "jpeg", "png"];

const remarksInclude = {
  model: Remark,
  as: "remarks",
  separate: true,
  attributes: ["id", "body", "addedBy", "createdAt", "updatedAt"],
  order: [["createdAt", "ASC"]],
};

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

    // 7. Verify the detected file type matches allowed types
    const detectedExt = `.${fileType.ext}`.toLowerCase();
    if (!ALLOWED_FILE_TYPES.includes(detectedExt)) {
      fs.unlinkSync(filePath);
      throw new Error(`File content does not match extension. Detected: ${fileType.mime}, Expected: image/jpeg or image/png`);
    }

    // 8. Verify MIME type from actual content matches expected
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

const REQUIRED_FIELDS = [
  "description",
  "location",
  "reportedBy",
  "item",
];

const OPTIONAL_FIELDS = ["endUser", "levelOfRepair", "status", "targetDate"];

const collectBodyFields = (body) => {
  const payload = {};
  [...REQUIRED_FIELDS, ...OPTIONAL_FIELDS].forEach((field) => {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  });

  if (!payload.status) {
    payload.status = "Pending";
  }

  return payload;
};

// Helper function to extract year and month from date
const extractYearAndMonth = (date) => {
  if (!date) {
    const now = new Date();
    return {
      year: String(now.getFullYear()),
      month: now.toLocaleString("en-US", { month: "long" }),
    };
  }

  const dateObj = date instanceof Date ? date : new Date(date);
  if (isNaN(dateObj.getTime())) {
    const now = new Date();
    return {
      year: String(now.getFullYear()),
      month: now.toLocaleString("en-US", { month: "long" }),
    };
  }

  return {
    year: String(dateObj.getFullYear()),
    month: dateObj.toLocaleString("en-US", { month: "long" }),
  };
};

const generateControlNumber = async (itemId) => {
  try {
    // Get the Item and its associated ItemsCode
    const item = await Items.findByPk(itemId, {
      include: [
        {
          model: ItemsCode,
          as: "itemCode",
          attributes: ["itemCode"],
        },
      ],
    });

    if (!item || !item.itemCode) {
      throw new Error("Item or ItemCode not found");
    }

    const itemCode = item.itemCode.itemCode;
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    // Find all controlNumbers in the current month (global increment regardless of item)
    // We need to find the highest increment number, not just the latest by createdAt
    const yearMonth = `${year}-${month}`;
    const pattern = `RMF-%-${yearMonth}-%`;

    const allConcerns = await Concern.findAll({
      where: {
        controlNumber: {
          [Op.like]: pattern,
        },
      },
      attributes: ["controlNumber"],
    });

    let maxIncrement = 0;
    
    // Extract increment numbers from all control numbers and find the maximum
    allConcerns.forEach((concern) => {
      if (concern.controlNumber) {
        const parts = concern.controlNumber.split("-");
        if (parts.length === 5) {
          const increment = parseInt(parts[4], 10);
          if (!isNaN(increment) && increment > maxIncrement) {
            maxIncrement = increment;
          }
        }
      }
    });

    // Set increment to maxIncrement + 1, or 1 if no concerns found
    const increment = maxIncrement + 1;

    const controlNumber = `RMF-${itemCode}-${year}-${month}-${String(increment).padStart(3, "0")}`;
    return controlNumber;
  } catch (error) {
    throw new Error(`Failed to generate control number: ${error.message}`);
  }
};

// GET ALL CONCERNS
export const getConcerns = async (req, res) => {
  try {
    const { userEmail } = req.query;
    const concerns = await Concern.findAll({
      include: [remarksInclude],
      order: [["createdAt", "DESC"]],
    });

    if (!userEmail) {
      return res.status(200).json(concerns);
    }

    const normalizedEmail = userEmail.toLowerCase();

    const filteredConcerns = concerns.filter((concern) => {
      const reporterEmail = concern.reportedBy
        ? concern.reportedBy.toLowerCase()
        : null;
      // Only show concerns where the user is the reporter
      return reporterEmail === normalizedEmail;
    });

    res.status(200).json(filteredConcerns);
  } catch (error) {
    console.error("Get concerns error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

// GET ONE CONCERN
export const getConcernById = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id, {
      include: [remarksInclude],
    });
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }
    res.status(200).json(concern);
  } catch (error) {
    console.error("Get concern by ID error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

// GET CONCERN BY CONTROL NUMBER
export const getConcernByControlNumber = async (req, res) => {
  try {
    const { controlNumber } = req.params;
    const concern = await Concern.findOne({
      where: { controlNumber },
      include: [remarksInclude],
    });
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }
    res.status(200).json(concern);
  } catch (error) {
    console.error("Get concern by control number error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

// CREATE NEW CONCERN
export const createConcern = async (req, res) => {
  try {
    // Handle maintenanceType from frontend, map it to item field
    if (req.body.maintenanceType && !req.body.item) {
      req.body.item = req.body.maintenanceType;
    }

    const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    // Generate controlNumber based on item
    let controlNumber;
    try {
      controlNumber = await generateControlNumber(req.body.item);
    } catch (controlErr) {
      console.error("Generate control number error:", controlErr);
      return res.status(400).json({ message: "Failed to generate control number. Please try again." });
    }

    let filename = null;
    if (req.files && req.files.file) {
      try {
        filename = await saveUploadedFile(req.files.file);
      } catch (fileErr) {
        console.error("File upload error:", fileErr);
        // Return generic message for security, but keep specific validation messages for user experience
        const isValidationError = fileErr.message.includes("Invalid file format") || 
                                  fileErr.message.includes("File too large") ||
                                  fileErr.message.includes("Invalid MIME type");
        return res.status(422).json({ 
          message: isValidationError ? fileErr.message : "File upload failed. Please try again." 
        });
      }
    }

    const payload = collectBodyFields(req.body);
    payload.controlNumber = controlNumber;
    payload.fileUrl = filename;
    
    // Handle dateReceived (createdAt)
    if (req.body.dateReceived) {
      payload.createdAt = new Date(req.body.dateReceived);
    } else {
      // If no dateReceived provided, use current date
      payload.createdAt = new Date();
    }
    
    // Auto-fill year and month based on createdAt
    const { year, month } = extractYearAndMonth(payload.createdAt);
    payload.year = year;
    payload.month = month;
    
    // Handle dateAccomplished (updatedAt)
    // Only set updatedAt if status is "Completed" or dateAccomplished is provided
    if (req.body.dateAccomplished) {
      payload.updatedAt = new Date(req.body.dateAccomplished);
    } else if (req.body.status === "Completed") {
      // If status is Completed but no dateAccomplished, set to current date
      payload.updatedAt = new Date();
    } else {
      // Otherwise, keep it null
      payload.updatedAt = null;
    }

    const concern = await Concern.create(payload);
    res.status(201).json({ message: "Concern created successfully", concern });
  } catch (error) {
    console.error("Create concern error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

// UPDATE CONCERN
export const updateConcern = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id);
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }

    // Handle maintenanceType from frontend, map it to item field
    if (req.body.maintenanceType && !req.body.item) {
      req.body.item = req.body.maintenanceType;
    }

    const missing = REQUIRED_FIELDS.filter(
      (field) => !req.body[field] && concern[field] == null
    );
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
    }

    // If item is being updated, regenerate controlNumber
    const itemId = req.body.item || concern.item;
    let controlNumber = concern.controlNumber;
    
    if (req.body.item && req.body.item !== concern.item) {
      try {
        controlNumber = await generateControlNumber(req.body.item);
      } catch (controlErr) {
        console.error("Generate control number error:", controlErr);
        return res.status(400).json({ message: "Failed to generate control number. Please try again." });
      }
    }

    let filename = concern.fileUrl;
    if (req.files && req.files.file) {
      try {
        const newFilename = await saveUploadedFile(req.files.file);
        deleteUploadedFile(concern.fileUrl);
        filename = newFilename;
      } catch (fileErr) {
        console.error("File upload error:", fileErr);
        // Return generic message for security, but keep specific validation messages for user experience
        const isValidationError = fileErr.message.includes("Invalid file format") || 
                                  fileErr.message.includes("File too large") ||
                                  fileErr.message.includes("Invalid MIME type");
        return res.status(422).json({ 
          message: isValidationError ? fileErr.message : "File upload failed. Please try again." 
        });
      }
    }

    const payload = collectBodyFields({ ...concern.dataValues, ...req.body });
    payload.controlNumber = controlNumber;
    payload.fileUrl = filename;
    
    // Handle dateReceived (createdAt) - can be edited
    if (req.body.dateReceived) {
      payload.createdAt = new Date(req.body.dateReceived);
    } else {
      // Keep existing createdAt if not provided
      payload.createdAt = concern.createdAt;
    }
    
    // Auto-fill year and month based on createdAt (update if createdAt changed)
    const { year, month } = extractYearAndMonth(payload.createdAt);
    payload.year = year;
    payload.month = month;
    
    // Handle dateAccomplished (updatedAt) - can be edited
    if (req.body.dateAccomplished) {
      payload.updatedAt = new Date(req.body.dateAccomplished);
    } else if (req.body.status === "Completed") {
      // If status is Completed but no dateAccomplished provided
      // Set to current date if it was null, otherwise keep existing
      payload.updatedAt = concern.updatedAt || new Date();
    } else {
      // If status is not Completed and no dateAccomplished, set to null
      payload.updatedAt = null;
    }

    await concern.update(payload);
    res.status(200).json({ message: "Concern updated successfully" });
  } catch (error) {
    console.error("Update concern error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};

// DELETE CONCERN
export const deleteConcern = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id);
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }

    deleteUploadedFile(concern.fileUrl);
    await concern.destroy();
    res.status(200).json({ message: "Concern deleted successfully" });
  } catch (error) {
    console.error("Delete concern error:", error);
    res.status(500).json({ message: "An error occurred. Please try again later." });
  }
};
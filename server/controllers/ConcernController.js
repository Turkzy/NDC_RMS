import fs from "fs";
import path from "path";
import Concern from "../models/ConcernModel.js";
import { Items, ItemsCode } from "../models/Dropdown/ItemsIndex.js";
import { Op } from "sequelize";

const UPLOAD_DIR = path.resolve("public/concernfiles");
const ALLOWED_FILE_TYPES = [".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 5_000_000; // 5 MB

const ensureUploadDir = () => {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
};

const saveUploadedFile = async (file) => {
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_FILE_TYPES.includes(ext)) {
    throw new Error("Invalid file format");
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File too large");
  }

  ensureUploadDir();

  const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const filePath = path.join(UPLOAD_DIR, filename);
  await file.mv(filePath);

  return filename;
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

const OPTIONAL_FIELDS = [
  "endUser",
  "levelOfRepair",
  "status",
  "remarks",
  "targetDate",
];

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

    // Find the last controlNumber in the current month (global increment regardless of item)
    const yearMonth = `${year}-${month}`;
    const pattern = `RMF-%-${yearMonth}-%`;

    const lastConcern = await Concern.findOne({
      where: {
        controlNumber: {
          [Op.like]: pattern,
        },
      },
    order: [["createdAt", "DESC"]],
    });

    let increment = 1;
    if (lastConcern && lastConcern.controlNumber) {
      // Extract the increment number from the last controlNumber
      const parts = lastConcern.controlNumber.split("-");
      if (parts.length === 5) {
        const lastIncrement = parseInt(parts[4], 10);
        if (!isNaN(lastIncrement)) {
          increment = lastIncrement + 1;
        }
      }
    }

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
    const concerns = await Concern.findAll();

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
    res.status(500).json({ message: error.message });
  }
};

// GET ONE CONCERN
export const getConcernById = async (req, res) => {
  try {
    const concern = await Concern.findByPk(req.params.id);
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }
    res.status(200).json(concern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET CONCERN BY CONTROL NUMBER
export const getConcernByControlNumber = async (req, res) => {
  try {
    const { controlNumber } = req.params;
    const concern = await Concern.findOne({
      where: { controlNumber },
    });
    if (!concern) {
      return res.status(404).json({ message: "Concern not found" });
    }
    res.status(200).json(concern);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res.status(400).json({ message: controlErr.message });
    }

    let filename = null;
    if (req.files && req.files.file) {
      try {
        filename = await saveUploadedFile(req.files.file);
      } catch (fileErr) {
        return res.status(422).json({ message: fileErr.message });
      }
    }

    const payload = collectBodyFields(req.body);
    payload.controlNumber = controlNumber;
    payload.fileUrl = filename;
    const now = new Date();
    payload.createdAt = now;
    // updatedAt is null on creation, only set on updates

    const concern = await Concern.create(payload);
    res.status(201).json({ message: "Concern created successfully", concern });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
        return res.status(400).json({ message: controlErr.message });
      }
    }

    let filename = concern.fileUrl;
    if (req.files && req.files.file) {
      try {
        const newFilename = await saveUploadedFile(req.files.file);
        deleteUploadedFile(concern.fileUrl);
        filename = newFilename;
      } catch (fileErr) {
        return res.status(422).json({ message: fileErr.message });
      }
    }

    const payload = collectBodyFields({ ...concern.dataValues, ...req.body });
    payload.controlNumber = controlNumber;
    payload.fileUrl = filename;
    payload.createdAt = concern.createdAt;
    payload.updatedAt = new Date();

    await concern.update(payload);
    res.status(200).json({ message: "Concern updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};
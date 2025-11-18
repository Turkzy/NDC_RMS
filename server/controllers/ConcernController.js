import fs from "fs";
import path from "path";
import Concern from "../models/ConcernModel.js";

const UPLOAD_DIR = path.resolve("public/concernfiles");
const ALLOWED_FILE_TYPES = [".doc", ".docx", ".pdf", ".pptx", ".xlsx"];
const MAX_FILE_SIZE = 100_000_000; // 100 MB

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
  "endUser",
  "reportedBy",
  "reportReceivedBy",
  "levelOfRepair",
  "dateReceived",
  "deliveryDays",
  "targetDate",
  "controlNumber",
  "remarks",
];

const collectBodyFields = (body) => {
  const payload = {};
  REQUIRED_FIELDS.forEach((field) => {
    payload[field] = body[field];
  });
  payload.status = body.status || "Pending";
  payload.dateCompleted = body.dateCompleted || null;
  return payload;
};

// GET ALL CONCERNS
export const getConcerns = async (_req, res) => {
  try {
    const concerns = await Concern.findAll();
    res.status(200).json(concerns);
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

// CREATE NEW CONCERN
export const createConcern = async (req, res) => {
  try {
    const missing = REQUIRED_FIELDS.filter((field) => !req.body[field]);
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
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
    payload.fileUrl = filename;

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

    const missing = REQUIRED_FIELDS.filter(
      (field) => !req.body[field] && concern[field] == null
    );
    if (missing.length) {
      return res
        .status(400)
        .json({ message: `Missing required fields: ${missing.join(", ")}` });
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
    payload.fileUrl = filename;

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
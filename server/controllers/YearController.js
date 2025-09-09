import Year from "../models/YearModel.js";
import Month from "../models/MonthModel.js";
import Monitoring from "../models/MonitoringModel.js";
import { Op } from "sequelize";
import path from "path";
import fs from "fs";

//CREATE YEAR
export const createYearWithMonths = async (req, res) => {
  const { year } = req.body;

  if (!year) return res.status(400).json({ message: "Year is required" });

  try {
    const existingYear = await Year.findOne({ where: { year } });
    if (existingYear)
      return res.status(409).json({ message: "Year already exists" });

    const newYear = await Year.create({ year });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    for (const name of monthNames) {
      await Month.create({ month: name, yearId: newYear.id });
    }

    res.status(201).json({ message: "Year and Months created successfully" });
  } catch (error) {
    console.error("Error creating year:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//GET YEAR
export const getYearsWithMonth = async (req, res) => {
  try {
    const years = await Year.findAll({
      include: [
        {
          model: Month,
          attributes: ["id", "month", "yearId"],
        },
      ],
      order: [["year", "DESC"]],
    });

    res.status(200).json(years);
  } catch (error) {
    console.error("Error fetching years:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//EDIT YEAR
export const editYearWithMonths = async (req, res) => {
  const { id } = req.params;
  const { year } = req.body;

  try {
    const existingYear = await Year.findByPk(id);
    if (!existingYear) {
      return res.status(404).json({ message: "Year not found" });
    }

    existingYear.year = year;
    await existingYear.save();
    res.status(200).json({ message: "Year updated successfully" });
  } catch (error) {
    console.error("Error updating year:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//DELETE YEAR WITH MONTHS
export const deleteYearWithMonths = async (req, res) => {
  const { id } = req.params;
  try {
    const year = await Year.findByPk(id);

    if (!year) {
      return res.status(404).json({ message: "Year not found" });
    }
    await Month.destroy({
      where: { yearId: id },
    });
    await year.destroy();
    res
      .status(200)
      .json({ message: "Year and its months deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//-------------------------------------------------------------------

//CREATE MANUAL REQUEST
export const createManualMonitoringRecord = async (req, res) => {
  try {
    const {
      workgroup,
      requestedby,
      issue,
      serviceby,
      status,
      repairDone,
      monthId,
      customControlNo,
      dateRequested,
      dateAccomplished,
    } = req.body;

    console.log("Received request body:", req.body);

    // Validate required fields
    if (!workgroup || !requestedby || !issue || !monthId) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }

    // Verify the month exists
    const month = await Month.findByPk(monthId);
    if (!month) {
      return res.status(404).json({ message: "Month not found" });
    }

    // Get the year associated with this month
    const year = await Year.findByPk(month.yearId);
    if (!year) {
      return res.status(404).json({ message: "Year not found" });
    }

    // Generate or use provided control number
    let controlno;

    if (customControlNo) {
      const existingRecord = await Monitoring.findOne({
        where: { controlno: customControlNo },
      });

      if (existingRecord) {
        return res.status(409).json({
          message: "Control number already exists",
        });
      }

      controlno = customControlNo;
    } else {
      const currentYear = year.year;
      const latest = await Monitoring.findOne({
        where: {
          controlno: {
            [Op.like]: `${currentYear}-%`,
          },
        },
        order: [["createdAt", "DESC"]],
      });

      let nextNo = 109;
      if (latest) {
        const last = parseInt(latest.controlno.split("-")[1]);
        nextNo = last + 1;
      }

      controlno = `${currentYear}-${nextNo}`;
    }

    // Parse and validate dates
    const parsedDateRequested = dateRequested
      ? new Date(dateRequested)
      : new Date();
    const parsedDateAccomplished = dateAccomplished
      ? new Date(dateAccomplished)
      : new Date();

    if (isNaN(parsedDateRequested.getTime())) {
      return res.status(400).json({ message: "Invalid dateRequested format" });
    }

    if (isNaN(parsedDateAccomplished.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid dateAccomplished format" });
    }

    // Create the monitoring record with manual timestamps
    const newMonitoring = await Monitoring.create({
      workgroup,
      requestedby,
      issue,
      controlno,
      serviceby: serviceby || null,
      status: status || "Completed",
      repairDone: repairDone || null,
      monthId,
      createdAt: parsedDateRequested,
      updatedAt: parsedDateAccomplished,
    });

    console.log("Created record:", newMonitoring.toJSON());

    res.status(201).json({
      message: "Monitoring record created successfully",
      monitoring: newMonitoring,
    });
  } catch (error) {
    console.error("Error creating manual monitoring record:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//CREATE REQUEST ✅
//CREATE REQUEST ✅
export const createMonitoringAutoMonth = async (req, res) => {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear(); // e.g. 2025
    const currentMonthName = currentDate.toLocaleString("default", {
      month: "long",
    }); // e.g. January

    // Check if the year exists in the Year table
    const year = await Year.findOne({ where: { year: currentYear } });
    if (!year) {
      return res.status(404).json({ message: `Year ${currentYear} not found` });
    }

    // Get month entry for current month and year
    const month = await Month.findOne({
      where: {
        month: currentMonthName,
        yearId: year.id,
      },
    });

    if (!month) {
      return res.status(404).json({
        message: `Month ${currentMonthName} not found for year ${currentYear}`,
      });
    }

    // Extract from req.body - including optional controlno
    const { workgroup, requestedby, issue, controlno } = req.body;
remote
    const now = new Date();
    const newMonitoring = await Monitoring.create({
      workgroup,
      requestedby,
      issue,
      controlno: controlno || null, // Use provided controlno or set to null if blank/undefined
      monthId: month.id,
      createdAt: now,
      updatedAt: now,
    });

    res.status(201).json({
      message: "Monitoring created successfully",
      monitoring: newMonitoring,
    });
  } catch (error) {
    console.error("Error creating monitoring:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//FETCH TABLE ✅
export const getMonitoringByMonthId = async (req, res) => {
  try {
    const { monthId } = req.params;
    const monitoring = await Monitoring.findAll({
      where: { monthId },
      paranoid: false,
    });

    res.status(200).json(monitoring);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching monitoring data", error });
  }
};

//GET ALL THE TABLE FROM MONITORING ✅
export const getAllMonitoring = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const monitoring = await Monitoring.findAndCountAll({
      where: { deletedAt: null },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      data: monitoring.rows,
      total: monitoring.count,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

//GET ALL THE TABLE FROM MONITORING ✅
export const getAllSoftMonitoring = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const monitoring = await Monitoring.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      paranoid: false,
    });
    res.status(200).json({
      data: monitoring.rows,
      total: monitoring.count,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// UPDATED REQUEST ✅
export const editMonitoring = async (req, res) => {
  try {
  const fileupload = await Monitoring.findOne({ where: { id: req.params.id } });
  if (!fileupload) {
    return res.status(404).json({ msg: "Request Not Found" });
  }
  let filename = fileupload.fileUrl;

  if (req.files && req.files.file) {
    const file = req.files.file;
    const fileSize = file.size;
    const ext = path.extname(file.name).toLowerCase();
    const allowType = [".doc", ".docx", ".pdf"];

    if (!allowType.includes(ext)){
      return res.status(422).json({ msg: "Invalid File Format" });
    }
    if (fileSize > 10_000_000) {
      return res.status(422).json({ msg: "Files must be less than 10MB" });
    }

    filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const oldPath = `./public/files/${fileupload.fileUrl}`;
    if (fs.existsSync(oldPath) && fileupload.fileUrl) {
      try {
        fs.unlinkSync(oldPath);
      } catch (err) {
        console.error("Error deleting old file:", err);
      }
    }

    try {
      await file.mv(`./public/files/${filename}`);
    } catch (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ msg: "Failed to upload Files" });
    }
  }

  const { id } = req.params;
  const { status, repairDone, serviceby, controlno, createdAt, updatedAt } =
    req.body;

    const monitoring = await Monitoring.findByPk(id);

    if (!monitoring) {
      return res.status(404).json({ message: "Monitoring record not found" });
    }

    await monitoring.update({
      status,
      repairDone,
      serviceby,
      controlno,
      fileUrl: filename,
      // Safely convert string to Date only if provided
      ...(createdAt && { createdAt: new Date(createdAt) }),
      ...(updatedAt && { updatedAt: new Date(updatedAt) }),
    });

    res.status(200).json({ message: "Monitoring record updated successfully" });
  } catch (error) {
    console.error("Error updating monitoring:", error);
    res.status(500).json({ message: "Server error during update" });
  }
};

//SOFT DELETE
export const softdeleteMonitoring = async (req, res) => {
  try {
    const { id } = req.params;

    const monitoring = await Monitoring.findByPk(id);
    if (!monitoring) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Manually set deletedAt without changing updatedAt
    await Monitoring.update(
      { deletedAt: new Date() },
      {
        where: { id },
        silent: true, // <-- prevents Sequelize from updating updatedAt
      }
    );

    res.status(200).json({ message: "Monitoring record soft-deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error soft-deleting record", error });
  }
};

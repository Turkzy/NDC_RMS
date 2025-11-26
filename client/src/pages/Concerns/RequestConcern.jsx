import React, { useEffect, useState, useRef } from "react";
import {
  X,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  FileText,
  Download,
  TriangleAlert,
} from "lucide-react";
import Tesseract from "tesseract.js";
import bgrequest from "../../assets/bg2.png";
import logo from "../../assets/ndc_logo.png";
import api, { endpoints } from "../../config/api";

const RequestConcern = () => {
  // State management
  const [itemsList, setItemsList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Ticket modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [submittedConcern, setSubmittedConcern] = useState(null);

  // Status check state
  const [showStatusCheck, setShowStatusCheck] = useState(false);
  const [statusCheckControlNumber, setStatusCheckControlNumber] = useState("");
  const [statusCheckResult, setStatusCheckResult] = useState(null);
  const [statusCheckLoading, setStatusCheckLoading] = useState(false);
  const [statusCheckError, setStatusCheckError] = useState("");
  const [ocrProgress, setOcrProgress] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    reportedBy: "",
    location: "",
    maintenanceType: "",
    description: "",
    image: null,
  });

  // Fetch data on mount
  useEffect(() => {
    fetchItems();
    fetchLocations();
  }, []);

  // ==================== FETCH OPERATIONS ====================
  const fetchItems = async () => {
    try {
      const res = await api.get(endpoints.items.getAllItems);
      if (res.data.error === false && res.data.data) {
        setItemsList(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get(endpoints.locations.getAllLocations);
      // LocationController returns { locations } directly
      if (res.data.locations) {
        setLocations(res.data.locations);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      // toast.error("Failed to fetch locations. Please try again.");
    }
  };

  // ==================== FORM HANDLERS ====================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image: e.target.files[0] || null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    // Validate required fields
    if (
      !formData.reportedBy ||
      !formData.location ||
      !formData.maintenanceType ||
      !formData.description
    ) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Find location name from ID
      const selectedLocation = locations.find(
        (loc) => loc.id.toString() === formData.location
      );
      const locationName = selectedLocation
        ? selectedLocation.locationName
        : formData.location;

      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append("reportedBy", formData.reportedBy);
      submitData.append("location", locationName);
      submitData.append("maintenanceType", formData.maintenanceType);
      submitData.append("description", formData.description);

      if (formData.image) {
        submitData.append("file", formData.image);
      }

      const response = await api.post(endpoints.concerns.create, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.message && response.data.concern) {
        setSuccess(response.data.message);
        // Store submitted concern data
        setSubmittedConcern(response.data.concern);
        setShowTicketModal(true);
        // Reset form
        setFormData({
          reportedBy: "",
          location: "",
          maintenanceType: "",
          description: "",
          image: null,
        });
        // Reset file input
        const fileInput = document.getElementById("image");
        if (fileInput) fileInput.value = "";
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to submit concern. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================== STATUS CHECK HANDLERS ====================
  const handleStatusCheck = async () => {
    if (!statusCheckControlNumber.trim()) {
      setStatusCheckError("Please enter a control number");
      return;
    }

    setStatusCheckLoading(true);
    setStatusCheckError("");
    setStatusCheckResult(null);

    try {
      const response = await api.get(
        endpoints.concerns.getByControlNumber(statusCheckControlNumber.trim())
      );
      setStatusCheckResult(response.data);
    } catch (err) {
      setStatusCheckError(
        err.response?.data?.message ||
          err.message ||
          "Concern not found. Please check your control number."
      );
      setStatusCheckResult(null);
    } finally {
      setStatusCheckLoading(false);
    }
  };

  const handleTicketUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png)/)) {
      setStatusCheckError("Please upload a valid image file (PNG, JPG, JPEG)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setStatusCheckError("Image size must be less than 5MB");
      return;
    }

    setStatusCheckLoading(true);
    setStatusCheckError("");
    setStatusCheckResult(null);
    setOcrProgress(0);

    try {
      // Use OCR to extract control number from image
      const {
        data: { text },
      } = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          // Update progress bar
          if (m.status === "recognizing text") {
            const progress = Math.round(m.progress * 100);
            setOcrProgress(progress);
          } else if (
            m.status === "initializing tesseract" ||
            m.status === "loading language traineddata"
          ) {
            setOcrProgress(10);
          } else if (m.status === "initialized tesseract") {
            setOcrProgress(20);
          }
        },
        // Optimize for speed - focus on digits and uppercase letters
        tessedit_char_whitelist: "RMF-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        // Use faster OCR engine mode - single uniform block
        tessedit_pageseg_mode: "6", // Assume uniform block of text
      });

      // Extract control number pattern: RMF-{itemCode}-{year}-{month}-{increment}
      // Item code should be LETTERS ONLY (no numbers) - but OCR might read O as 0, so we'll correct it
      // Pattern: RMF followed by item code (letters only preferred), then 4-digit year, 2-digit month, 3-digit increment
      // Allow for multiple dashes or spaces (OCR might add extra dashes)

      // First try with letters only for item code
      let controlNumberPattern =
        /RMF[-]{0,2}[A-Z]+[-]{0,2}\d{4}[-]{0,2}\d{2}[-]{0,2}\d{3}/gi;
      let matches = text.match(controlNumberPattern);

      // If no match, try with alphanumeric (OCR might have read O as 0)
      if (!matches) {
        controlNumberPattern =
          /RMF[-]{0,2}[A-Z0-9]+[-]{0,2}\d{4}[-]{0,2}\d{2}[-]{0,2}\d{3}/gi;
        matches = text.match(controlNumberPattern);
      }

      // If no match, try without strict dash requirements (OCR might miss dashes)
      if (!matches) {
        const flexiblePattern = /RMF\s*[A-Z0-9]+\s*\d{4}\s*\d{2}\s*\d{3}/gi;
        matches = text.match(flexiblePattern);
      }

      // If still no match, try even more flexible pattern
      if (!matches) {
        const veryFlexiblePattern =
          /RMF[-\s]*[A-Z0-9]+[-\s]*\d{4}[-\s]*\d{2}[-\s]*\d{3}/gi;
        matches = text.match(veryFlexiblePattern);
      }

      if (matches && matches.length > 0) {
        // Use the first match found and normalize it
        let extractedControlNumber = matches[0]
          .replace(/\s+/g, "-") // Replace spaces with dashes
          .replace(/-+/g, "-") // Normalize multiple dashes to single dash
          .toUpperCase()
          .trim();

        // Ensure proper format: RMF-XXX-YYYY-MM-XXX
        extractedControlNumber = extractedControlNumber.replace(
          /RMF\s*/i,
          "RMF-"
        );

        // Fix any remaining double dashes or formatting issues
        extractedControlNumber = extractedControlNumber
          .replace(/--+/g, "-") // Replace multiple consecutive dashes with single dash
          .replace(/RMF-+/g, "RMF-") // Ensure RMF- has only one dash after it
          .replace(/-+/g, "-"); // Final normalization of all dashes

        // Split control number to fix item code (letters only)
        const parts = extractedControlNumber.split("-");
        if (parts.length >= 5 && parts[0] === "RMF") {
          const itemCodePart = parts[1];

          // Fix common OCR mistakes in item code: 0->O, 1->I, 5->S
          // Item codes should be letters only
          if (/\d/.test(itemCodePart)) {
            let correctedItemCode = itemCodePart
              .replace(/0/g, "O") // Replace 0 with O (fixes "0th" -> "Oth")
              .replace(/1/g, "I") // Replace 1 with I
              .replace(/5/g, "S") // Replace 5 with S
              .replace(/[^A-Z]/g, ""); // Remove any remaining non-letters

            // Only update if we got a valid letter-only code
            if (
              correctedItemCode.length > 0 &&
              /^[A-Z]+$/.test(correctedItemCode)
            ) {
              parts[1] = correctedItemCode;
              extractedControlNumber = parts.join("-");
            }
          }
        }

        setStatusCheckControlNumber(extractedControlNumber);

        // Automatically search for the concern
        try {
          const response = await api.get(
            endpoints.concerns.getByControlNumber(extractedControlNumber)
          );
          setStatusCheckResult(response.data);
          setStatusCheckError("");
        } catch (apiErr) {
          // Try alternative formats if first attempt fails
          // Fix common OCR issues: double dashes, missing dashes, item code corrections, etc.
          const parts = extractedControlNumber.split("-");
          let correctedFormat = extractedControlNumber;

          // If item code has numbers, try correcting them
          if (parts.length >= 5 && parts[0] === "RMF" && /\d/.test(parts[1])) {
            const correctedItemCode = parts[1]
              .replace(/0/g, "O")
              .replace(/1/g, "I")
              .replace(/5/g, "S")
              .replace(/[^A-Z]/g, "");
            if (correctedItemCode.length > 0) {
              parts[1] = correctedItemCode;
              correctedFormat = parts.join("-");
            }
          }

          const altFormats = [
            correctedFormat, // Try with corrected item code first
            extractedControlNumber.replace(/--+/g, "-"), // Fix double dashes
            extractedControlNumber.replace(/(RMF)(-+)([A-Z0-9]+)/i, "RMF-$3"), // Fix RMF--XXX to RMF-XXX
            extractedControlNumber.replace(
              /(\d{4})-?(\d{2})-?(\d{3})/,
              "$1-$2-$3"
            ), // Ensure date format
            extractedControlNumber.replace(/-/g, ""), // Remove all dashes
            extractedControlNumber.replace(/(\d{4})(\d{2})/, "$1-$2"), // Fix date format
          ];

          // Remove duplicates
          const uniqueFormats = [...new Set(altFormats)];

          let found = false;
          for (const altFormat of uniqueFormats) {
            try {
              const altResponse = await api.get(
                endpoints.concerns.getByControlNumber(altFormat)
              );
              setStatusCheckResult(altResponse.data);
              setStatusCheckError("");
              setStatusCheckControlNumber(altFormat); // Update with working format
              found = true;
              break;
            } catch (e) {
              // Continue to next format
            }
          }

          if (!found) {
            setStatusCheckError(
              `Control number found but concern not found. Extracted: ${extractedControlNumber}. Please verify manually or try entering it directly.`
            );
          }
        }
      } else {
        // Quick fallback: search for any RMF pattern with numbers
        const quickPattern = /RMF.*?\d{4}.*?\d{2}.*?\d{3}/gi;
        const quickMatch = text.match(quickPattern);

        if (quickMatch) {
          let cleaned = quickMatch[0]
            .replace(/[^\w-]/g, "-") // Replace non-word chars with dashes
            .replace(/-+/g, "-") // Normalize dashes
            .toUpperCase();

          // Try to fix format
          cleaned = cleaned.replace(/RMF\s*/i, "RMF-");
          cleaned = cleaned.replace(/(\d{4})(\d{2})/, "$1-$2-");

          setStatusCheckControlNumber(cleaned);

          try {
            const response = await api.get(
              endpoints.concerns.getByControlNumber(cleaned)
            );
            setStatusCheckResult(response.data);
            setStatusCheckError("");
          } catch (e) {
            setStatusCheckError(
              `Found pattern but couldn't match format. Extracted: ${cleaned}. Please verify manually.`
            );
          }
        } else {
          setStatusCheckError(
            "Could not find a valid control number in the image. Please try:\n" +
              "• Uploading a clearer, higher resolution image\n" +
              "• Ensuring the ticket is well-lit and in focus\n" +
              "• Entering the control number manually"
          );
        }
      }
    } catch (err) {
      console.error("OCR Error:", err);
      setStatusCheckError(
        err.message ||
          "Failed to process image. Please try entering the control number manually."
      );
      setStatusCheckResult(null);
    } finally {
      setStatusCheckLoading(false);
      setOcrProgress(0);
      // Reset file input
      e.target.value = "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <CheckCircle className="text-green-600" size={24} />;
      case "in progress":
        return <Clock className="text-yellow-600" size={24} />;
      case "pending":
        return <AlertCircle className="text-red-600" size={24} />;
      default:
        return <AlertCircle className="text-gray-600" size={24} />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-50 border border-green-200 text-green-700";
      case "in progress":
        return "bg-yellow-50 border border-yellow-200 text-yellow-700";
      case "pending":
        return "bg-red-50 border border-red-200 text-red-700";
      default:
        return "bg-gray-50 border border-gray-200 text-gray-700";
    }
  };

  const getLevelOfRepairIcon = (levelOfRepair) => {
    switch (levelOfRepair?.toLowerCase()) {
      case "minor":
        return <TriangleAlert size={14} className="text-yellow-700" />;
      case "major":
        return <TriangleAlert size={14} className="text-orange-700" />;
      case "critical/urgent":
        return <TriangleAlert size={14} className="text-red-700" />;
      default:
        return <TriangleAlert size={14} className="text-gray-700" />;
    }
  };

  const getLevelOfRepairBadgeClass = (levelOfRepair) => {
    switch (levelOfRepair?.toLowerCase()) {
      case "minor":
        return "bg-yellow-100 border border-yellow-200 text-yellow-700";
      case "major":
        return "bg-orange-100 border border-orange-200 text-orange-700";
      case "critical/urgent":
        return "bg-red-100 border border-red-200 text-red-700";
      default:
        return "bg-gray-50 border border-gray-200 text-gray-700";
    }
  };

  // Download ticket as image
  const downloadTicket = () => {
    if (!submittedConcern) return;

    // Create a smaller canvas for a compact ticket
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 200;

    // Light green background
    const gradient = ctx.createLinearGradient(
      0,
      0,
      canvas.width,
      canvas.height
    );
    gradient.addColorStop(0, "#d1fae5");
    gradient.addColorStop(1, "#a7f3d0");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 2;
    ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

    // Draw small title at top
    ctx.fillStyle = "#065f46";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText("NDC RMS", canvas.width / 2, 30);

    // Draw control number (main focus - larger and centered)
    ctx.fillStyle = "#1e293b";
    ctx.font = "bold 20px monospace";
    ctx.fillText(
      submittedConcern.controlNumber,
      canvas.width / 2,
      canvas.height / 2 + 10
    );

    // Draw small footer
    ctx.fillStyle = "#64748b";
    ctx.font = "8px Arial";
    ctx.fillText("Keep for reference", canvas.width / 2, canvas.height - 15);

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ticket-${submittedConcern.controlNumber}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  return (
    <div
      className="relative min-h-screen bg-center bg-cover flex flex-col md:flex-row select-none"
      style={{ backgroundImage: `url(${bgrequest})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/80 via-white/70 to-emerald-100/60 backdrop-blur-[2px]"></div>

      <div className="relative flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-3xl">
          <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img src={logo} alt="logo" className="h-20 drop-shadow-lg" />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-emerald-600">
                  NDC RMS
                </p>
                <h1 className="text-3xl md:text-4xl font-semibold text-slate-800 font-montserrat">
                  Report a Concern
                </h1>
                <p className="text-sm md:text-base text-slate-500">
                  Please fill out the form below or check your concern status.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs for Report vs Status Check */}
          <div className="mb-6 flex gap-2 border-b border-emerald-200">
            <button
              onClick={() => setShowStatusCheck(false)}
              className={`px-6 py-3 font-semibold transition ${
                !showStatusCheck
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              Report Concern
            </button>
            <button
              onClick={() => setShowStatusCheck(true)}
              className={`px-6 py-3 font-semibold transition ${
                showStatusCheck
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-slate-500 hover:text-emerald-600"
              }`}
            >
              Check Status
            </button>
          </div>

          {/* Status Check Section */}
          {showStatusCheck && (
            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[32px] border border-white/80 p-8 mb-6">
              <h2 className="text-2xl font-semibold text-slate-800 font-montserrat mb-6">
                Check Concern Status
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Control Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your control number (e.g., RMF-XXX-2024-01-001)"
                      value={statusCheckControlNumber}
                      onChange={(e) =>
                        setStatusCheckControlNumber(e.target.value)
                      }
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleStatusCheck()
                      }
                      className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                    />
                    <button
                      onClick={handleStatusCheck}
                      disabled={statusCheckLoading}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-white font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search size={20} />
                      {statusCheckLoading ? "Checking..." : "Check"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Or Upload Ticket Image
                  </label>
                  <label
                    htmlFor="ticket-upload"
                    className={`flex items-center justify-between rounded-2xl border-2 border-dashed px-5 py-4 text-sm cursor-pointer transition ${
                      statusCheckLoading
                        ? "border-emerald-400 bg-emerald-100/70 text-emerald-700 cursor-wait"
                        : "border-emerald-200 bg-emerald-50/70 text-emerald-600 hover:border-emerald-400"
                    }`}
                  >
                    <span className="font-semibold flex items-center gap-2">
                      <FileText size={20} />
                      {statusCheckLoading
                        ? "Processing Image..."
                        : "Upload Ticket Image"}
                    </span>
                    <span className="text-xs text-emerald-500">
                      {statusCheckLoading
                        ? "Extracting control number..."
                        : "PNG, JPG up to 5MB"}
                    </span>
                  </label>
                  <input
                    type="file"
                    onChange={handleTicketUpload}
                    className="hidden"
                    accept="image/jpeg, image/png, image/jpg"
                    id="ticket-upload"
                    disabled={statusCheckLoading}
                  />
                  {statusCheckLoading && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-600 mb-1">
                        <span>Processing image with OCR...</span>
                        <span className="font-semibold">{ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                          style={{ width: `${ocrProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {statusCheckError && (
                  <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                    {statusCheckError}
                  </div>
                )}

                {statusCheckResult && (
                  <div className="p-6 bg-gray-50 border border-gra-200 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(statusCheckResult.status)}
                        <h3 className="font-semibold text-slate-800">
                          Concern Status
                        </h3>
                      </div>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getLevelOfRepairBadgeClass(
                          statusCheckResult.levelOfRepair
                        )}`}
                      >
                        {getLevelOfRepairIcon(statusCheckResult.levelOfRepair)}
                        {statusCheckResult.levelOfRepair || "Minor"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 justify-between">
                      <p className="text-sm text-slate-600 font-medium">
                        Control Number: <span className="font-medium text-slate-800">{statusCheckResult.controlNumber}</span>
                      </p>
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
                          statusCheckResult.status
                        )}`}
                      >
                        {statusCheckResult.status || "Pending"}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 ">
                          Description
                        </p>
                        <p className="text-sm text-slate-800 text-justify">
                          {statusCheckResult.description || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          Location
                        </p>
                        <p className="text-sm text-slate-800">
                          {statusCheckResult.location || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          Reported By
                        </p>
                        <p className="text-sm text-slate-800">
                          {statusCheckResult.reportedBy || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
                          Date Received
                        </p>
                        <p className="text-sm text-slate-800">
                          {statusCheckResult.createdAt
                            ? new Date(
                                statusCheckResult.createdAt
                              ).toLocaleString("en-US", {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report Form Section */}
          {!showStatusCheck && (
            <div className="bg-white/80 backdrop-blur-xl shadow-2xl rounded-[32px] border border-white/80 p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                  {error}
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label
                      htmlFor="reportedBy"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Reported By
                    </label>
                    <input
                      type="text"
                      id="reportedBy"
                      name="reportedBy"
                      value={formData.reportedBy}
                      onChange={handleInputChange}
                      placeholder="Enter your name"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      htmlFor="location"
                      className="text-sm font-semibold text-slate-700"
                    >
                      Location
                    </label>
                    <select
                      value={formData.location}
                      onChange={handleInputChange}
                      id="location"
                      name="location"
                      required
                      className="w-full rounded-2xl border text-slate-500 border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                    >
                      <option value="">--Please choose an option--</option>
                      {locations.map((location) => (
                        <option key={location.id} value={location.id}>
                          {location.locationName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="maintenanceType"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Maintenance Type
                  </label>
                  <select
                    value={formData.maintenanceType}
                    onChange={handleInputChange}
                    id="maintenanceType"
                    name="maintenanceType"
                    required
                    className="w-full rounded-2xl border text-slate-500 border-slate-200 bg-white px-4 py-3 shadow-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                  >
                    <option value="">--Please choose an option--</option>
                    {itemsList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="description"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Describe the issue with relevant details..."
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm placeholder:text-slate-400 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition"
                  />
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="image"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Image (Optional)
                  </label>
                  <label
                    htmlFor="image"
                    className="flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-600 cursor-pointer hover:border-emerald-400 transition"
                  >
                    <span className="font-semibold">
                      {formData.image ? formData.image.name : "Upload Image"}
                    </span>
                    <span className="text-xs text-emerald-500">
                      PNG, JPG up to 5MB
                    </span>
                  </label>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg, image/png, image/jpg"
                  />
                  {formData.image && (
                    <p className="text-xs text-slate-500">
                      Selected: {formData.image.name}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-sm text-slate-500">
                    Reports are securely logged and tracked in real time.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3 text-white font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="relative flex-1 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 text-white overflow-hidden">
        <div className="absolute -top-10 -left-6 w-48 h-48 bg-white/10 rotate-12 rounded-2xl"></div>
        <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-white/5 -rotate-12 rounded-3xl"></div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-10 py-20 space-y-8">
          <p className="uppercase tracking-[0.7em] text-white/70 text-sm">
            NDC RMS
          </p>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            Repair & Maintenance System
          </h2>
          <p className="text-lg text-white/90 max-w-xl">
            Streamline facility upkeep, monitor equipment status, and keep
            maintenance schedules on track with powerful workflow tools designed
            for National Development Company.
          </p>
        </div>
      </div>

      {/* Ticket Modal */}
      {showTicketModal && submittedConcern && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50 p-4"
          onClick={() => setShowTicketModal(false)}
        >
          <div
            className="bg-white p-6 rounded-lg max-w-[50rem] w-full my-4 max-h-[calc(100vh-2rem)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-slate-800 font-montserrat">
                  Concern Submitted Successfully!
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Please save your control number for tracking
                </p>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Ticket */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-xl p-6 mb-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="bg-white rounded-full p-3 shadow-lg">
                    <CheckCircle className="text-emerald-600" size={40} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-2">
                    Control Number
                  </p>
                  <p className="text-2xl font-bold text-slate-800 font-mono">
                    {submittedConcern.controlNumber}
                  </p>
                </div>
                <div className="pt-4 border-t border-emerald-200">
                  <button
                    onClick={downloadTicket}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-full font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition"
                    title="Download Ticket"
                  >
                    <Download size={20} />
                    Download Ticket
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please save or screenshot this
                control number. You can use it to check the status of your
                concern anytime.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowTicketModal(false);
                  setShowStatusCheck(true);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-white font-semibold shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition"
              >
                <Search size={20} />
                Check Status
              </button>
              <button
                onClick={() => setShowTicketModal(false)}
                className="flex-1 inline-flex items-center justify-center rounded-full bg-slate-200 px-6 py-3 text-slate-700 font-semibold hover:bg-slate-300 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestConcern;

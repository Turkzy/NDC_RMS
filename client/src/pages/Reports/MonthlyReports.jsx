import React, { useEffect, useState, useMemo } from "react";
import {
  CircleCheck,
  Clock,
  AlertCircle,
  TriangleAlert,
  FileDown,
  FileSpreadsheet,
  X,
  ChevronDown,
} from "lucide-react";
import api, { endpoints, FILE_BASE_URL } from "../../config/api";
import ExcelJS from "exceljs";
import logo from "../../assets/ndc_logo.png";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DEFAULT_STATUS_COLORS = {
  Pending: "#fa2a2a",
  "In Progress": "#f59e0b",
  Completed: "#22c55e",
  default: "#94a3b8",
};

const MonthlyReports = () => {
  const [concerns, setConcerns] = useState([]);
  const [locations, setLocations] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [editingConcern, setEditingConcern] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchConcerns(), fetchLocations(), fetchItems()]);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const fetchConcerns = async () => {
    try {
      const response = await api.get(endpoints.concerns.getAll);
      if (Array.isArray(response.data)) {
        setConcerns(response.data);
      }
    } catch (err) {
      console.error("Failed to load concerns", err);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get(endpoints.locations.getAllLocations);
      if (res.data?.locations) {
        setLocations(res.data.locations);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const fetchItems = async () => {
    try {
      const res = await api.get(endpoints.items.getAllItems);
      if (res.data?.error === false && res.data?.data) {
        setItemsList(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching items:", err);
    }
  };

  const getItemLabel = (value) => {
    if (!value) return "N/A";
    const match = itemsList.find((item) => String(item.id) === String(value));
    return match ? match.itemName : value;
  };

  const getLocationLabel = (value) => {
    if (!value) return "N/A";
    const match = locations.find(
      (loc) => String(loc.id) === String(value) || loc.locationName === value
    );
    return match ? match.locationName : value;
  };

  const getLatestRemarkText = (remarks) => {
    if (!Array.isArray(remarks) || remarks.length === 0) return "";
    return remarks[remarks.length - 1]?.body || "";
  };

  const getFileUrl = (fileName) => {
    if (!fileName) return null;
    return `${FILE_BASE_URL}${endpoints.concernfiles.getFile(fileName)}`;
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Completed") {
      return "bg-green-100 border border-green-200 text-green-700";
    } else if (status === "In Progress") {
      return "bg-yellow-100 border border-yellow-200 text-yellow-700";
    } else {
      return "bg-red-100 border border-red-200 text-red-600";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "Completed") {
      return <CircleCheck size={14} />;
    } else if (status === "In Progress") {
      return <Clock size={14} />;
    } else {
      return <AlertCircle size={14} />;
    }
  };

  const openConcernModal = (concern) => {
    setEditingConcern(concern);
    setShowConcernModal(true);
  };

  const closeConcernModal = () => {
    setShowConcernModal(false);
    setEditingConcern(null);
  };

  // Current year and month labels (used for sensible defaults)
  const now = useMemo(() => new Date(), []);
  const currentYear = String(now.getFullYear());
  const currentMonthLabel = now.toLocaleString("en-US", { month: "long" });

  // Get unique years from concerns
  const availableYears = useMemo(() => {
    const years = new Set();
    concerns.forEach((concern) => {
      if (concern.year) {
        years.add(String(concern.year));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a)); // Sort descending
  }, [concerns]);

  // All 12 months - always available in dropdown
  const allMonths = [
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

  // Ensure a concrete default year and month are selected
  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      if (availableYears.includes(currentYear)) {
        setSelectedYear(currentYear);
      } else {
        setSelectedYear(availableYears[0]);
      }
    }
  }, [availableYears, selectedYear, currentYear]);

  useEffect(() => {
    if (!selectedMonth) {
      setSelectedMonth(currentMonthLabel);
    }
  }, [selectedMonth, currentMonthLabel]);

  // Filter concerns based on selected year and month
  const filteredConcerns = useMemo(() => {
    return concerns.filter((concern) => {
      const matchesYear =
        !selectedYear || String(concern.year) === selectedYear;
      const matchesMonth = !selectedMonth || concern.month === selectedMonth;
      return matchesYear && matchesMonth;
    });
  }, [concerns, selectedYear, selectedMonth]);

  const pieChartData = useMemo(() => {
    // Group by maintenance type (item)
    const counts = {};
    filteredConcerns.forEach((concern) => {
      const key = getItemLabel(concern.item);
      counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = labels.map((label) => counts[label]);

    // Color palette for maintenance types
    const chartColors = [
      "rgb(255, 150, 150)", // Soft Red
      "rgb(140, 190, 255)", // Soft Blue
      "rgb(255, 220, 120)", // Soft Yellow
      "rgb(140, 240, 200)", // Soft Teal
      "rgb(190, 150, 255)", // Soft Purple
      "rgb(255, 180, 130)", // Soft Orange
      "rgb(190, 190, 190)", // Soft Gray
      "rgb(150, 170, 255)", // Periwinkle
      "rgb(255, 150, 230)", // Light Magenta
      "rgb(160, 240, 160)", // Soft Green
      "rgb(255, 170, 150)", // Light Coral
      "rgb(170, 150, 255)", // Soft Violet
      "rgb(150, 240, 240)", // Light Cyan
      "rgb(255, 210, 150)", // Light Gold
      "rgb(220, 170, 255)", // Light Lavender
      "rgb(150, 210, 255)", // Light Sky
      "rgb(255, 190, 170)", // Peach
      "rgb(200, 255, 150)", // Light Lime
      "rgb(160, 190, 255)", // Light Royal
      "rgb(255, 150, 190)", // Light Pink
    ];

    const backgroundColor = labels.map((_, index) => {
      return chartColors[index % chartColors.length];
    });

    return {
      labels,
      datasets: [
        {
          label: "Maintenance Types",
          data,
          backgroundColor,
          borderWidth: 2,
          hoverOffset: 10,
        },
      ],
    };
  }, [filteredConcerns, itemsList]);

  const displayedConcerns = useMemo(() => {
    return filteredConcerns;
  }, [filteredConcerns]);

  const handleOpenPrint = () => {
    const params = new URLSearchParams({
      year: selectedYear || currentYear,
      month: selectedMonth || currentMonthLabel,
    }).toString();
    // Use relative path so BrowserRouter basename (e.g. /NDC_RMS/) is respected
    window.open(
      `print-monthly-reports?${params}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleExportExcel = async () => {
    if (!displayedConcerns || displayedConcerns.length === 0) {
      return;
    }

    const fileMonth = selectedMonth || currentMonthLabel;
    const fileYear = selectedYear || currentYear;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Monthly Report", {
      pageSetup: { orientation: "landscape" },
    });

    // Add company logo in the top-left corner, similar to the print layout
    try {
      const res = await fetch(logo);
      const imageBuffer = await res.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });
      // Place logo roughly over the left side of the header area
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 60 },
      });
    } catch (e) {
      console.warn("Unable to load logo for Excel export:", e);
    }

    // Column widths matching print layout
    sheet.columns = [
      { key: "no", width: 4 },
      { key: "controlNumber", width: 18 },
      { key: "description", width: 40 },
      { key: "location", width: 18 },
      { key: "maintenanceType", width: 22 },
      { key: "reportedBy", width: 18 },
      { key: "endUser", width: 18 },
      { key: "levelOfRepair", width: 16 },
      { key: "targetDate", width: 16 },
      { key: "dateReceived", width: 18 },
      { key: "dateAccomplished", width: 18 },
      { key: "duration", width: 10 },
      { key: "status", width: 12 },
      { key: "lastRemark", width: 40 },
    ];

    // Title rows
    sheet.mergeCells("A1:N1");
    sheet.mergeCells("A2:N2");
    sheet.mergeCells("A3:N3");
    sheet.getCell("A1").value = "REPAIR AND MAINTENANCE SUMMARY REPORT";
    sheet.getCell("A2").value = "NATIONAL DEVELOPMENT COMPANY";
    sheet.getCell("A3").value = `For the month of ${fileMonth} ${fileYear}`;

    sheet.getCell("A1").font = { size: 16, bold: true };
    sheet.getCell("A2").font = { size: 12, bold: true };
    sheet.getCell("A3").font = { size: 11 };
    ["A1", "A2", "A3"].forEach((addr) => {
      sheet.getCell(addr).alignment = { horizontal: "center" };
    });

    // Blank row (row 4) for spacing
    sheet.getRow(4).height = 4;

    // Header row (row 5)
    const headerRowIndex = 5;
    const headers = [
      "No.",
      "Control Number",
      "Description",
      "Location",
      "Maintenance Type",
      "Reported By",
      "End User",
      "Level of Repair",
      "Target Date",
      "Date Received",
      "Date Accomplished",
      "Duration",
      "Status",
      "Last Remark",
    ];

    headers.forEach((text, idx) => {
      const cell = sheet.getCell(headerRowIndex, idx + 1);
      cell.value = text;
      cell.font = { bold: true };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "0da805" }, // soft yellow
      };
      cell.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFD1D5DB" } },
        bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
        left: { style: "thin", color: { argb: "FFD1D5DB" } },
        right: { style: "thin", color: { argb: "FFD1D5DB" } },
      };
    });

    // Data rows start at row 6
    displayedConcerns.forEach((concern, index) => {
      const targetDate = concern.targetDate
        ? new Date(concern.targetDate).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—";

      const dateReceived = concern.createdAt
        ? new Date(concern.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—";

      const dateAccomplished = concern.updatedAt
        ? new Date(concern.updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        : "—";

      let duration = "—";
      if (concern.createdAt && concern.updatedAt) {
        const start = new Date(concern.createdAt);
        const end = new Date(concern.updatedAt);
        if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime())) {
          const diffTime = Math.abs(end - start);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          duration = `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
        }
      }

      const lastRemark = getLatestRemarkText(concern.remarks) || "—";

      const rowData = [
        index + 1,
        concern.controlNumber || "—",
        concern.description || "—",
        getLocationLabel(concern.location) || "—",
        getItemLabel(concern.item) || "—",
        concern.reportedBy || "—",
        concern.endUser || "—",
        concern.levelOfRepair || "—",
        targetDate,
        dateReceived,
        dateAccomplished,
        duration,
        concern.status || "Pending",
        lastRemark,
      ];
      const row = sheet.addRow(rowData);
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin", color: { argb: "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: "FFD1D5DB" } },
          left: { style: "thin", color: { argb: "FFD1D5DB" } },
          right: { style: "thin", color: { argb: "FFD1D5DB" } },
        };
        cell.alignment = { vertical: "top", wrapText: true };
      });
    });

    const fileName = `Monthly_Report_${fileMonth}_${fileYear}.xlsx`;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatRemarkDate = (value) => {
    if (!value) return "--:--";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const RemarksList = ({ remarks }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!Array.isArray(remarks) || remarks.length === 0) {
      return (
        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 inline-flex items-center min-h-[60px]">
          —
        </span>
      );
    }

    const latestRemark =
      Array.isArray(remarks) && remarks.length > 0
        ? remarks[remarks.length - 1]
        : null;
    const latestPreview = (() => {
      if (!latestRemark?.body) return "—";
      const trimmed = latestRemark.body.trim();
      if (trimmed.length <= 120) return trimmed;
      return `${trimmed.slice(0, 117)}...`;
    })();

    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-700">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        >
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 line-clamp-2">
              {latestPreview}
            </span>
            <span className="text-xs text-slate-500">
              {formatRemarkDate(latestRemark?.createdAt)}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`shrink-0 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-3">
            {remarks.map((remark, index) => (
              <div key={remark.id || `remark-${index}`}>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {remark.body || "—"}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {formatRemarkDate(remark.createdAt)}
                </p>
                {index < remarks.length - 1 && (
                  <div className="my-3 border-t border-slate-100" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white rounded-lg p-6 select-none">
      <div className="mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
              Reports Overview
            </p>
            <h1 className="text-3xl font-semibold uppercase text-slate-600 mt-2">
              Monthly Reports
            </h1>
            <p className="text-sm text-slate-500">
              Monitoring the repair and maintenance of the facility.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleOpenPrint}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-2 rounded-lg font-semibold transition duration-300"
            >
              <FileDown /> Generate Reports
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-2 py-2 rounded-lg font-semibold transition duration-300"
            >
              <FileSpreadsheet />
              Excel Download
            </button>
          </div>
        </header>
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <label className="text-xs font-semibold text-slate-500 uppercase">
            Month
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          >
            {allMonths.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Charts Section */}
        <section className="flex justify-center">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm w-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase text-slate-500">
                  Maintenance Type Distribution
                </p>
                <p className="text-sm text-slate-400">
                  Breakdown of concerns by maintenance type
                </p>
              </div>
            </div>
            <div className="">
              {pieChartData.datasets[0].data.some((val) => val > 0) ? (
                <div className="w-full flex justify-center h-96">
                  <Pie
                    data={pieChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                          labels: { usePointStyle: false },
                        },
                        datalabels: {
                          color: "#1f2937",
                          formatter: (value, context) => {
                            const data = context.chart.data.datasets[0].data;
                            const total = data.reduce(
                              (sum, val) => sum + val,
                              0
                            );
                            if (!total || value === 0) return ""; // hide 0% labels
                            const percentage = ((value / total) * 100).toFixed(
                              1
                            );
                            return `${percentage}%`;
                          },
                          font: {
                            weight: "bold",
                            size: 16,
                          },
                        },
                      },
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-sm text-slate-500">
                  No data to display yet.
                </p>
              )}
            </div>
          </article>
        </section>

        {/* Table Section */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto text-sm">
              <thead className="sticky top-0 z-10 bg-slate-100">
                <tr className="bg-slate-100 font-montserrat text-sm text-gray-800">
                  <th className="px-2 py-1 text-center">No.</th>
                  <th className="px-2 py-1 text-center">Description</th>
                  <th className="px-2 py-1 text-center">Control Number</th>
                  <th className="px-2 py-1 text-center">Location</th>
                  <th className="px-2 py-1 text-center">Maintenance Type</th>
                  <th className="px-2 py-1 text-center">Level of Repair</th>
                  <th className="px-2 py-1 text-center">Remarks</th>
                  <th className="px-2 py-1 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      Loading concerns...
                    </td>
                  </tr>
                ) : displayedConcerns.length === 0 ? (
                  <tr className="hover:bg-slate-50 transition">
                    <td
                      colSpan="8"
                      className="px-4 py-4 text-center text-gray-500"
                    >
                      No concerns found
                    </td>
                  </tr>
                ) : (
                  displayedConcerns.map((concern, index) => (
                    <tr
                      key={concern.id ?? index}
                      className="hover:bg-slate-50 transition font-montserrat text-sm text-gray-500 even:bg-slate-100 cursor-pointer"
                      onClick={() => openConcernModal(concern)}
                    >
                      <td className="px-4 py-2 text-center">{index + 1}</td>
                      <td className="px-4 py-2 text-center whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                        {concern.description || "--:--"}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {concern.controlNumber || "--:--"}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {getLocationLabel(concern.location)}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {getItemLabel(concern.item)}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        {concern.levelOfRepair ? (
                          <span
                            className={
                              "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold " +
                              (concern.levelOfRepair === "Minor"
                                ? "bg-yellow-100 border border-yellow-200 text-yellow-700"
                                : concern.levelOfRepair === "Major"
                                ? "bg-orange-100 border border-orange-200 text-orange-700"
                                : "bg-red-100 border border-red-200 text-red-600")
                            }
                          >
                            <TriangleAlert size={14} />
                            {concern.levelOfRepair}
                          </span>
                        ) : (
                          "--:--"
                        )}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                        {getLatestRemarkText(concern.remarks) || "--:--"}
                      </td>
                      <td className="px-4 py-2 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(
                            concern.status
                          )}`}
                        >
                          {getStatusIcon(concern.status)}
                          {concern.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Details Modal */}
      {showConcernModal && editingConcern && (
        <div
          className="fixed inset-0 bg-slate-900/70  flex justify-center items-center z-50 p-4"
          onClick={closeConcernModal}
        >
          <div
            className="w-full max-w-6xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-h-[calc(100vh-2rem)] overflow-y-auto border border-slate-100">
              {/* Header */}
              <div className="flex flex-wrap gap-4 items-start justify-between px-8 pt-8 pb-4 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold font-montserrat text-slate-800">
                      Details
                    </h2>
                  </div>
                </div>
                <button
                  onClick={closeConcernModal}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full p-2 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="px-8 pb-8">
                <div className="space-y-6 mt-6">
                  {/* Meta Section */}
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                        Concern Details
                      </p>
                      <p className="text-sm text-slate-500">
                        View the primary information for this request.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Control Number
                        </label>
                        <span
                          className={`inline-flex w-full items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold ${getStatusBadgeClass(
                            editingConcern.status
                          )}`}
                        >
                          {editingConcern.controlNumber || "—"}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Description
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 font-medium inline-flex items-center gap-2 min-h-[60px]">
                          {editingConcern.description || "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Assignment Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                          Assignment
                        </p>
                        <p className="text-sm text-slate-500">
                          Where and to whom the issue applies.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Location
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {getLocationLabel(editingConcern.location) || "—"}
                        </span>
                      </div>

                      {/* Maintenance Type */}
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Maintenance Type
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {getItemLabel(editingConcern.item) || "—"}
                        </span>
                      </div>

                      {/* Reported By */}
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Reported By
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.reportedBy || "—"}
                        </span>
                      </div>

                      {/* End User */}
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          End User
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.endUser || "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Status Section */}
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                        Progress
                      </p>
                      <p className="text-sm text-slate-500">
                        Define timelines, severity, and status.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Level of Repair
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.levelOfRepair || "—"}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Target Date
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.targetDate
                            ? new Date(
                                editingConcern.targetDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Date Information */}
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                        Timeline
                      </p>
                      <p className="text-sm text-slate-500">
                        Important dates for this concern.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Date Received
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.createdAt
                            ? new Date(editingConcern.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Date Accomplished
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.updatedAt
                            ? new Date(editingConcern.updatedAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Duration
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.createdAt && editingConcern.updatedAt
                            ? (() => {
                                const start = new Date(
                                  editingConcern.createdAt
                                );
                                const end = new Date(editingConcern.updatedAt);
                                const diffTime = Math.abs(end - start);
                                const diffDays = Math.ceil(
                                  diffTime / (1000 * 60 * 60 * 24)
                                );
                                return `${diffDays} day${
                                  diffDays !== 1 ? "s" : ""
                                }`;
                              })()
                            : "—"}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Notes Section */}
                  <section className="space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                        Notes & Attachments
                      </p>
                      <p className="text-sm text-slate-500">
                        Extra context or supporting files.
                      </p>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Remarks
                        </label>
                        <RemarksList remarks={editingConcern.remarks} />
                      </div>
                      {editingConcern.fileUrl && (
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Image
                          </label>
                          <div className="mt-2 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                            <img
                              src={getFileUrl(editingConcern.fileUrl)}
                              alt="Concern attachment"
                              className="max-h-80 w-full rounded-xl object-contain"
                              onClick={() =>
                                window.open(
                                  getFileUrl(editingConcern.fileUrl),
                                  "_blank"
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyReports;

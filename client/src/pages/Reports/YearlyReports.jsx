import React, { useEffect, useMemo, useState } from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import { TriangleAlert, X } from "lucide-react";
import ExcelJS from "exceljs";
import logo from "../../assets/ndc_logo.png";
import api, { endpoints, FILE_BASE_URL } from "../../config/api";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const MONTHS = [
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

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const YearlyReports = () => {
  const [concerns, setConcerns] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [editingConcern, setEditingConcern] = useState(null);

  // Current year (fallback for print params)
  const now = useMemo(() => new Date(), []);
  const currentYear = useMemo(() => String(now.getFullYear()), [now]);

  useEffect(() => {
    const fetchConcerns = async () => {
      try {
        setLoading(true);
        setError("");
        const [concernsRes, locationsRes, itemsRes] = await Promise.all([
          api.get(endpoints.concerns.getAll),
          api.get(endpoints.locations.getAllLocations),
          api.get(endpoints.items.getAllItems),
        ]);
        if (Array.isArray(concernsRes.data)) {
          setConcerns(concernsRes.data);
        }
        if (locationsRes.data?.locations) {
          setLocations(locationsRes.data.locations);
        }
        if (itemsRes.data?.data) {
          setItems(itemsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load yearly concerns", err);
        setError("Unable to load yearly data.");
      } finally {
        setLoading(false);
      }
    };
    fetchConcerns();
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set();
    concerns.forEach((concern) => {
      if (concern.year) {
        years.add(String(concern.year));
      } else if (concern.createdAt) {
        years.add(String(new Date(concern.createdAt).getFullYear()));
      }
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [concerns]);

  useEffect(() => {
    if (!selectedYear && availableYears.length > 0) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const filteredConcerns = useMemo(() => {
    if (!selectedYear) return [];
    return concerns.filter((concern) => {
      const yearValue = concern.year
        ? String(concern.year)
        : concern.createdAt
        ? String(new Date(concern.createdAt).getFullYear())
        : "";
      return yearValue === selectedYear;
    });
  }, [concerns, selectedYear]);

  const monthCounts = useMemo(() => {
    const counts = Array(12).fill(0);
    filteredConcerns.forEach((concern) => {
      let monthIndex = -1;
      if (concern.month) {
        monthIndex = MONTHS.findIndex((m) => m === concern.month);
      } else if (concern.createdAt) {
        monthIndex = new Date(concern.createdAt).getMonth();
      }
      if (monthIndex >= 0) counts[monthIndex] += 1;
    });
    return counts;
  }, [filteredConcerns]);

  const quarterCounts = useMemo(() => {
    const quarters = [0, 0, 0, 0];
    monthCounts.forEach((count, idx) => {
      const q = Math.floor(idx / 3);
      quarters[q] += count;
    });
    return quarters;
  }, [monthCounts]);

  const totalConcerns = useMemo(() => filteredConcerns.length, [filteredConcerns]);

  const displayedConcerns = useMemo(() => filteredConcerns, [filteredConcerns]);

  const getLocationLabel = (value) => {
    if (!value) return "Unspecified";
    const match =
      locations.find(
        (loc) => String(loc.id) === String(value) || loc.locationName === value
      ) || {};
    return match.locationName || value || "Unspecified";
  };

  const getItemLabel = (value) => {
    if (!value) return "Other";
    const match = items.find((item) => String(item.id) === String(value)) || {};
    return match.itemName || value || "Other";
  };

  const formatPlainDate = (value) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDurationInDays = (createdAt, updatedAt) => {
    if (!createdAt || !updatedAt) return "—";
    const start = new Date(createdAt);
    const end = new Date(updatedAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "—";
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
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

  const openConcernModal = (concern) => {
    setEditingConcern(concern);
    setShowConcernModal(true);
  };

  const closeConcernModal = () => {
    setShowConcernModal(false);
    setEditingConcern(null);
  };

  const handlePrint = () => {
    const year = selectedYear || currentYear;
    const params = new URLSearchParams({ year }).toString();
    window.open(`print-yearly-reports?${params}`, "_blank", "noopener,noreferrer");
  };

  const handleExportExcel = async () => {
    if (!displayedConcerns || displayedConcerns.length === 0) {
      return;
    }

    const fileYear = selectedYear || currentYear;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Yearly Report", {
      pageSetup: { orientation: "landscape" },
    });

    try {
      const res = await fetch(logo);
      const imageBuffer = await res.arrayBuffer();
      const imageId = workbook.addImage({
        buffer: imageBuffer,
        extension: "png",
      });
      sheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 120, height: 60 },
      });
    } catch (e) {
      console.warn("Unable to load logo for Excel export:", e);
    }

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

    sheet.mergeCells("A1:N1");
    sheet.mergeCells("A2:N2");
    sheet.mergeCells("A3:N3");
    sheet.getCell("A1").value = "REPAIR AND MAINTENANCE SUMMARY REPORT";
    sheet.getCell("A2").value = "NATIONAL DEVELOPMENT COMPANY";
    sheet.getCell("A3").value = `For the year of ${fileYear}`;

    sheet.getCell("A1").font = { size: 16, bold: true };
    sheet.getCell("A2").font = { size: 12, bold: true };
    sheet.getCell("A3").font = { size: 11 };
    ["A1", "A2", "A3"].forEach((addr) => {
      sheet.getCell(addr).alignment = { horizontal: "center" };
    });

    sheet.getRow(4).height = 4;

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
        fgColor: { argb: "0da805" },
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

    displayedConcerns.forEach((concern, index) => {
      const targetDate = formatPlainDate(concern.targetDate);
      const dateReceived = formatPlainDate(concern.createdAt);
      const dateAccomplished = formatPlainDate(concern.updatedAt);
      const duration = getDurationInDays(concern.createdAt, concern.updatedAt);
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

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Yearly_Report_${fileYear}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const monthChartData = useMemo(() => {
    return {
      labels: MONTHS,
      datasets: [
        {
          label: "Concerns",
          data: monthCounts,
          backgroundColor: "#8cbeff",
          borderRadius: 12,
          barThickness: 22,
        },
      ],
    };
  }, [monthCounts]);

  const quarterChartData = useMemo(() => {
    const colors = [
      "#f9a8d4",
      "#c7d2fe",
      "#fcd34d",
      "#a7f3d0",
    ];
    return {
      labels: QUARTERS,
      datasets: [
        {
          label: "Concerns by Quarter",
          data: quarterCounts,
          backgroundColor: QUARTERS.map((_, i) => colors[i % colors.length]),
          borderWidth: 2,
          hoverOffset: 8,
        },
      ],
    };
  }, [quarterCounts]);

  return (
    <div className=" bg-white rounded-lg p-6 select-none">
      <div className="mx-auto space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
              Reports Overview
            </p>
            <h1 className="text-3xl font-semibold uppercase text-slate-600 mt-2">
              Yearly Reports
            </h1>
            <p className="text-sm text-slate-500">
              Yearly and quarterly breakdown of concerns.
            </p>
          </div>

          

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-lg font-semibold transition duration-300 text-sm"
            >
              Generate Report
            </button>
             <button
               onClick={handleExportExcel}
               className="flex items-center gap-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg font-semibold transition duration-300 text-sm"
             >
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
          </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            Loading yearly data...
          </div>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Concerns per Month
                    </p>
                    <p className="text-sm text-slate-400">
                      Distribution across months ({selectedYear || "—"})
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-72">
                  {totalConcerns ? (
                    <Bar
                      key={`months-${selectedYear}`}
                      data={monthChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 800, easing: "easeOutQuart" },
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          x: { grid: { display: false }, ticks: { font: { size: 10 } } },
                          y: { beginAtZero: true, ticks: { precision: 0 }, grid: { color: "#e2e8f0" } },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      No data to display.
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Concerns by Quarter
                    </p>
                    <p className="text-sm text-slate-400">
                      Quarterly distribution ({selectedYear || "—"})
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-72 flex items-center justify-center">
                  {totalConcerns ? (
                    <Pie
                      key={`quarters-${selectedYear}`}
                      data={quarterChartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        animation: { duration: 800, easing: "easeOutQuart" },
                        plugins: {
                          legend: { position: "bottom", labels: { usePointStyle: true } },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      No data to display.
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
          </>
        )}

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
                          {formatPlainDate(editingConcern.targetDate)}
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
                          {formatPlainDate(editingConcern.createdAt)}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Date Accomplished
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {formatPlainDate(editingConcern.updatedAt)}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Duration
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {getDurationInDays(editingConcern.createdAt, editingConcern.updatedAt)}
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
                        <div className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
                          {getLatestRemarkText(editingConcern.remarks) || "—"}
                        </div>
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
    </div>
  );
};

export default YearlyReports;
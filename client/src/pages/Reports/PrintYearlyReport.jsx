import React, { useEffect, useMemo, useState } from "react";
import api, { endpoints, FILE_BASE_URL } from "../../config/api";
import logo from "../../assets/ndc_logo.png";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PrintYearlyReport = () => {
  const [concerns, setConcerns] = useState([]);
  const [locations, setLocations] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current year (used as default / label)
  const now = useMemo(() => new Date(), []);
  const currentYear = String(now.getFullYear());

  // Read optional year from query string (?year=2025)
  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const qYear = search.get("year");
    if (qYear) setSelectedYear(qYear);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await Promise.all([fetchConcerns(), fetchLocations(), fetchItems()]);
      } catch (err) {
        console.error("Failed to load print data", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Ensure the chart is rendered before triggering print; run only once.
  const [hasScheduledPrint, setHasScheduledPrint] = useState(false);
  useEffect(() => {
    if (loading || hasScheduledPrint) return;

    const rafId = requestAnimationFrame(() => {
      const timeoutId = setTimeout(() => {
        window.print();
      }, 800); // allow chart to finish rendering
      return () => clearTimeout(timeoutId);
    });

    setHasScheduledPrint(true);

    return () => cancelAnimationFrame(rafId);
  }, [loading, hasScheduledPrint]);

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
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return "—";
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
  };

  const filteredConcerns = useMemo(() => {
    return concerns.filter((concern) => {
      const matchesYear =
        !selectedYear ||
        String(concern.year || new Date(concern.createdAt).getFullYear()) ===
          String(selectedYear);
      return matchesYear;
    });
  }, [concerns, selectedYear]);

  const pieChartData = useMemo(() => {
    // Group by maintenance type (item)
    const counts = {};
    filteredConcerns.forEach((concern) => {
      const key = getItemLabel(concern.item);
      counts[key] = (counts[key] || 0) + 1;
    });

    const labels = Object.keys(counts);
    const data = labels.map((label) => counts[label]);

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

  return (
    <div>
      <style>
        {`
        @page {
          size: legal landscape;
          margin: 1cm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        .print-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .print-header img {
          height: 60px;
        }
        .print-header-text h1 {
          margin: 0;
          font-size: 20px;
          text-transform: uppercase;
          font-weight: 600;
          font-family: 'Montserrat', sans-serif;
        }
        .print-header-text p {
          margin: 2px 0;
          font-size: 12px;
        }
        .print-subtitle {
          margin-top: 4px;
          font-size: 12px;
        }
        .print-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 10px;
        }
        .print-table th,
        .print-table td {
          border: 1px solid #d1d5db;
          padding: 4px 6px;
          text-align: left;
          vertical-align: top;
          font-size: 12px;
        }
        .print-table th {
          background-color: #e5e7eb;
          font-weight: 600;
          text-align: center;
        }
        .print-table tbody tr:nth-child(even) {
          background-color: #f9fafb;
        }
        .print-toolbar {
          margin-bottom: 12px;
        }
        @media print {
          .print-toolbar {
            display: none;
          }
        }
      `}
      </style>

      <div className="print-toolbar">
        <button
          onClick={() => window.print()}
          className=" float-right px-4 py-2 rounded bg-emerald-500 text-white text-sm font-semibold"
        >
          Print Report
        </button>
      </div>

      <div className="print-header">
        <img src={logo} alt="Company Logo" />
        <div className="print-header-text">
          <h1>Repair and Maintenance Summary Report</h1>
          <p className="text-md uppercase tracking-[0.3em]">
            National Development Company
          </p>
          <p className="print-subtitle">For the year of {selectedYear}</p>
        </div>
      </div>

      {loading ? (
        <p style={{ fontSize: 12 }}>Loading data...</p>
      ) : (
        <>
          {pieChartData.datasets[0].data.some((val) => val > 0) && (
            <div
              style={{
                width: "100%",
                maxWidth: "500px",
                height: "260px",
                margin: "0 auto 16px auto",
              }}
            >
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
                      color: "#000000",
                      formatter: (value, context) => {
                        const data = context.chart.data.datasets[0].data;
                        const total = data.reduce((sum, val) => sum + val, 0);
                        if (!total || value === 0) return "";
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${percentage}%`;
                      },
                      font: {
                        weight: "bold",
                        size: 10,
                      },
                    },
                  },
                }}
              />
            </div>
          )}

          <table className="print-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Control Number</th>
                <th>Description</th>
                <th>Location</th>
                <th>Maintenance Type</th>
                <th>Reported By</th>
                <th>End User</th>
                <th>Level of Repair</th>
                <th>Target Date</th>
                <th>Date Received</th>
                <th>Date Accomplished</th>
                <th>Duration</th>
                <th>Status</th>
                <th>Last Remark</th>
              </tr>
            </thead>
            <tbody>
              {filteredConcerns.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ textAlign: "center" }}>
                    No data available
                  </td>
                </tr>
              ) : (
                filteredConcerns.map((concern, index) => {
                  const lastRemark = getLatestRemarkText(concern.remarks) || "—";
                  return (
                    <tr key={concern.id ?? index}>
                      <td>{index + 1}</td>
                      <td>{concern.controlNumber || "—"}</td>
                      <td>
                        {(concern.description || "—")
                          .toString()
                          .replace(/</g, "&lt;")
                          .replace(/>/g, "&gt;")}
                      </td>
                      <td>{getLocationLabel(concern.location) || "—"}</td>
                      <td>{getItemLabel(concern.item) || "—"}</td>
                      <td>{concern.reportedBy || "—"}</td>
                      <td>{concern.endUser || "—"}</td>
                      <td>{concern.levelOfRepair || "—"}</td>
                      <td>{formatPlainDate(concern.targetDate)}</td>
                      <td>{formatPlainDate(concern.createdAt)}</td>
                      <td>{formatPlainDate(concern.updatedAt)}</td>
                      <td>{getDurationInDays(concern.createdAt, concern.updatedAt)}</td>
                      <td>{concern.status || "Pending"}</td>
                      <td>
                        {lastRemark.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default PrintYearlyReport;



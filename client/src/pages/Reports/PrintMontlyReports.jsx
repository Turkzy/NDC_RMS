import React, { useEffect, useMemo, useState } from "react";
import api, { endpoints } from "../../config/api";
import logo from "../../assets/ndc_logo.png";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const PrintMonthlyReports = () => {
  const [concerns, setConcerns] = useState([]);
  const [locations, setLocations] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current year and month (used as defaults / labels)
  const now = useMemo(() => new Date(), []);
  const currentYear = String(now.getFullYear());
  const currentMonthLabel = now.toLocaleString("en-US", { month: "long" });

  // Read optional year/month from query string (?year=2025&month=January)
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthLabel);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    const qYear = search.get("year");
    const qMonth = search.get("month");
    if (qYear) setSelectedYear(qYear);
    if (qMonth) setSelectedMonth(qMonth);
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
        // Auto-open print dialog once data is loaded
        setTimeout(() => window.print(), 500);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        !selectedYear || String(concern.year) === String(selectedYear);
      const matchesMonth =
        !selectedMonth || concern.month === String(selectedMonth);
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

    const backgroundColor = labels.map(() => {
      const r = Math.floor(120 + Math.random() * 105);
      const g = Math.floor(120 + Math.random() * 105);
      const b = Math.floor(120 + Math.random() * 105);
      return `rgb(${r}, ${g}, ${b})`;
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

  const titleMonth = selectedMonth || currentMonthLabel;
  const titleYear = selectedYear || currentYear;

  return (
    <div>
      <style>
        {`
        @page {
          /* Use US Legal size in landscape to maximize horizontal space */
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
          text-transform: uppercase;\
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
          className="px-4 py-2 rounded bg-emerald-500 text-white text-sm font-semibold"
        >
          Print
        </button>
      </div>

      <div className="print-header">
        <img src={logo} alt="Company Logo" />
        <div className="print-header-text">
          <h1>Repair and Maintenance Summary Report</h1>
          <p className="text-md uppercase tracking-[0.3em]">National Development Company</p>
          <p className="print-subtitle">
            For the month of {titleMonth} {titleYear}
          </p>
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
                        const data =
                          context.chart.data.datasets[0].data;
                        const total = data.reduce(
                          (sum, val) => sum + val,
                          0
                        );
                        if (!total || value === 0) return "";
                        const percentage = (
                          (value / total) *
                          100
                        ).toFixed(1);
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
                    <td>
                      {getDurationInDays(concern.createdAt, concern.updatedAt)}
                    </td>
                    <td>{concern.status || "Pending"}</td>
                    <td>
                      {lastRemark
                        .toString()
                        .replace(/</g, "&lt;")
                        .replace(/>/g, "&gt;")}
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

export default PrintMonthlyReports;



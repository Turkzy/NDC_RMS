import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { Printer, FileText } from "lucide-react";
import { FaRegFileExcel } from "react-icons/fa";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

ChartJS.register(ArcElement, Tooltip, Legend);

const Reports = () => {
  const [years, setYears] = useState([]);
  const [issueCounts, setIssueCounts] = useState({});
  const printRef = useRef(null);
  const navigate = useNavigate();
  const pieChartRef = useRef(null);

  const [selectedRows, setSelectedRows] = useState([]);

  const [selectedYearForMonitoring, setSelectedYearForMonitoring] =
    useState(null);
  const [selectedMonthForMonitoring, setSelectedMonthForMonitoring] =
    useState(null);
  const [monitoringData, setMonitoringData] = useState([]);

  const [monthsForSelectedYear, setMonthsForSelectedYear] = useState([]);

  const fetchMonthsForYear = async (yearId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/month/getByYear/${yearId}`
      );
      setMonthsForSelectedYear(res.data);
    } catch (error) {
      console.error("Error fetching months:", error);
    }
  };

  const handleSelectYear = async (yearId, yearValue) => {
    setSelectedYearForMonitoring(yearValue);
    setSelectedMonthForMonitoring(null);
    setMonitoringData([]);

    // Fetch months for the selected year
    await fetchMonthsForYear(yearId);
  };

  //GET TABLE FROM SELECTED MONTH
  const handleSelectMonth = async (monthId, monthName) => {
    setSelectedMonthForMonitoring(monthName);

    try {
      const res = await axios.get(
        `http://localhost:5000/api/year/get-request/${monthId}`
      );

      const data = res.data;
      setMonitoringData(data);

      // Count occurrences of issues
      const newIssueCounts = {};

      data.forEach((item) => {
        const issue = item.issue;
        if (newIssueCounts[issue]) {
          newIssueCounts[issue] += 1;
        } else {
          newIssueCounts[issue] = 1;
        }
      });

      setIssueCounts(newIssueCounts);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  //------------FETCH YEARS------------
  const fetchYears = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/year/get-year");
      setYears(res.data);
    } catch (error) {
      console.error("Error Fetching Years:", error);
    }
  };

  const pieData = {
    labels: Object.keys(issueCounts),
    datasets: [
      {
        label: "Number of Issues",
        data: Object.values(issueCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  const pieChartOptions = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataset = context.dataset;
            const total = dataset.data.reduce((sum, val) => sum + val, 0);
            const value = dataset.data[context.dataIndex];
            const percentage = ((value / total) * 100).toFixed(2);
            return `${context.label}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        color: "#0b1215",
        formatter: (value, context) => {
          const total = context.chart.data.datasets[0].data.reduce(
            (sum, val) => sum + val,
            0
          );
          const percentage = ((value / total) * 100).toFixed(1);
          return `${percentage}%`;
        },
        font: {
          weight: "bold",
          size: 14,
        },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  const handlePrint = () => {
    navigate("/print-Monthly-Report", {
      state: {
        year: selectedYearForMonitoring,
        month: selectedMonthForMonitoring,
        tableData: monitoringData,
        issueCounts: issueCounts,
      },
    });
  };

  //CONVERT TO EXCEL
  const handleExportExcel = async () => {
    if (!monitoringData || monitoringData.length === 0) {
      alert("No data to export.");
      return;
    }

    const canvas = pieChartRef.current;
    if (!canvas) {
      alert("Chart not found.");
      return;
    }

    const canvasImage = await html2canvas(canvas);
    const chartDataUrl = canvasImage.toDataURL("image/png");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Monthly Report");

    // Add headers
    worksheet.addRow([
      "Issue",
      "Occurrences",
      "Requested By",
      "Workgroup",
      "Repair Done",
      "Service By",
      "Date Requested",
      "Date Accomplished",
    ]);

    worksheet.columns = [
      { key: "issue", width: 20 },
      { key: "occurrences", width: 15 },
      { key: "requestedby", width: 20 },
      { key: "workgroup", width: 15 },
      { key: "repairDone", width: 25 },
      { key: "serviceby", width: 20 },
      { key: "createdAt", width: 25 },
      { key: "updatedAt", width: 25 },
    ];

    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 20;

    // Add rows
    monitoringData.forEach((item) => {
      worksheet.addRow([
        item.issue,
        issueCounts[item.issue] || "",
        item.requestedby,
        item.workgroup,
        item.repairDone,
        item.serviceby,
        new Date(item.createdAt).toLocaleString(),
        new Date(item.updatedAt).toLocaleString(),
      ]);
    });

    // Add pie chart image
    const imageId = workbook.addImage({
      base64: chartDataUrl,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 9, row: 1 },
      ext: { width: 400, height: 300 },
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
      new Blob([buffer]),
      `Monthly_Report_${selectedMonthForMonitoring}_${selectedYearForMonitoring}.xlsx`
    );
  };

  const handleFormPrint = (isSelectedPrint = false) => {
    if (isSelectedPrint && selectedRows.length === 0) {
      alert("Please select at least one row to print.");
      return;
    }
    navigate("/request-forms", {
      state: {
        year: selectedYearForMonitoring,
        month: selectedMonthForMonitoring,
        tableData: isSelectedPrint ? selectedRows : monitoringData,
        issueCounts: issueCounts,
      },
    });
  };

  const handleFormPrint1 = (item) => {
    navigate("/request-forms1", {
      state: {
        year: selectedYearForMonitoring,
        month: selectedMonthForMonitoring,
        requestData: item, // Pass the specific item instead of the entire dataset
      },
    });
  };

  const toggleRowSelection = (row) => {
    setSelectedRows((prev) => {
      if (prev.includes(row)) {
        return prev.filter((r) => r !== row);
      } else {
        if (prev.length >= 4) {
          alert("You can only select up to 4 rows for printing.");
          return prev;
        }
        return [...prev, row];
      }
    });
  };

  return (
    <div className="bg-slate-50 p-8 rounded-xl shadow-md text-center">
      <h1 className="text-2xl font-semibold font-montserrat">
        Summary Monthly Report
      </h1>
      <div className="mt-4 flex items-center gap-2">
        <select
          id="year"
          name="year"
          value={selectedYearForMonitoring || ""}
          onChange={(e) => {
            const selectedYearObj = years.find(
              (y) => y.year.toString() === e.target.value
            );
            if (selectedYearObj) {
              handleSelectYear(selectedYearObj.id, selectedYearObj.year);
            } else {
              setSelectedYearForMonitoring("");
              setMonthsForSelectedYear([]);
              setMonitoringData([]);
            }
          }}
          className="mt-1 block w-52 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <option value="">-- Select Year --</option>
          {[...years]
            .sort((a, b) => b.year - a.year)
            .map((yearItem) => (
              <option key={yearItem.id} value={yearItem.year}>
                {yearItem.year}
              </option>
            ))}
        </select>
      </div>
      {selectedYearForMonitoring && (
        <div className="grid grid-cols-6 gap-2 mt-4">
          {monthsForSelectedYear.map((month) => (
            <button
              key={month.id}
              className={`px-4 py-2 rounded ${
                selectedMonthForMonitoring === month.month
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
              onClick={() => handleSelectMonth(month.id, month.month)}
            >
              {month.month}
            </button>
          ))}
        </div>
      )}

      {selectedMonthForMonitoring && (
        <div className="mt-10 border-t-2 select-none">
          <div className="flex justify-end mb-4 mt-20 gap-2">
            <button
              onClick={handlePrint}
              className="bg-gray-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-gray-700 transition duration-300"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={handleExportExcel}
              className="bg-green-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-green-700 transition duration-300"
            >
              <FaRegFileExcel size={16} />
              Excel
            </button>
          </div>
          <div ref={printRef}>
            {Object.keys(issueCounts).length > 0 && (
              <div className="w-full md:w-[30rem] mx-auto mt-10 mb-10">
                <h2 className="text-lg font-semibold font-montserrat mb-4">
                  Number of Issues Occurence (Pie Chart)
                </h2>
                <Pie
                  ref={(el) => {
                    pieChartRef.current = el?.canvas;
                  }}
                  data={pieData}
                  options={pieChartOptions}
                  plugins={[ChartDataLabels]}
                />
              </div>
            )}
            <h2 className="text-xl font-semibold mb-4 mt-10 font-montserrat">
              Monitoring for {selectedMonthForMonitoring}{" "}
              {selectedYearForMonitoring}
            </h2>

            <div className="overflow-x-auto">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => handleFormPrint(true)}
                  className="bg-gray-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-gray-700 transition duration-300"
                >
                  <Printer size={16} />
                  Print Selected ({selectedRows.length})
                </button>
              </div>
              <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
                <thead>
                  <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                    <th className="border py-2 px-4 ">Issue</th>
                    <th className="border py-2 px-4 text-center">
                      Number of Occurence
                    </th>
                    <th className="border py-2 px-4">Name of User</th>
                    <th className="border py-2 px-4">Workgroup</th>
                    <th className="border py-2 px-4">Control No.</th>
                    <th className="border py-2 px-4">Repair Done</th>
                    <th className="border py-2 px-4">Service By</th>
                    <th className="border py-2 px-4">Date Requested</th>
                    <th className="border py-2 px-4">Date Accomplished</th>
                    <th className="border py-2 px-4">
                      Select to Print
                    </th>
                  </tr>
                </thead>
                <tbody className="font-montserrat">
                  {monitoringData.length > 0 ? (
                    Object.entries(
                      monitoringData.reduce((acc, item) => {
                        if (!acc[item.issue]) acc[item.issue] = [];
                        acc[item.issue].push(item);
                        return acc;
                      }, {})
                    ).map(([issue, items]) =>
                      items.map((item, index) => (
                        <tr
                          key={item.id + "-" + index}
                          className="even:bg-slate-100 border-t hover:bg-gray-300 transition duration-300t text-center"
                        >
                          <td className="py-1 px-2">
                            {index === 0 ? issue : ""}
                          </td>
                          <td className="py-1 px-2">
                            {index === 0 ? items.length : ""}
                          </td>
                          <td className="py-1 px-2">{item.requestedby}</td>
                          <td className="py-1 px-2">{item.controlno}</td>
                          <td className="py-1 px-2">{item.workgroup}</td>
                          <td className="py-1 px-2">{item.repairDone}</td>
                          <td className="py-1 px-2">{item.serviceby}</td>
                          <td className="py-1 px-2 whitespace-nowrap">
                            {new Date(item.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              }
                            )}
                            <br />
                            <span className="text-xs text-gray-500">
                              {new Date(item.createdAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: "true",
                                }
                              )}
                            </span>
                          </td>
                          <td className="py-1 px-2 whitespace-nowrap">
                            {new Date(item.updatedAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                              }
                            )}
                            <br />
                            <span className="text-xs text-gray-500">
                              {new Date(item.updatedAt).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: "true",
                                }
                              )}
                            </span>
                          </td>
                          <td className="py-1 px-2">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(item)}
                              onChange={() => toggleRowSelection(item)}
                              disabled={
                                !selectedRows.includes(item) &&
                                selectedRows.length >= 4
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    <tr>
                      <td colSpan="8" className="border p-2 text-center">
                        No monitoring data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;

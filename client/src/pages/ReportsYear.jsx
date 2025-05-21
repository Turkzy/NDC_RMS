import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Printer } from "lucide-react";
import { FaRegFileExcel } from "react-icons/fa";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import { saveAs } from "file-saver";

ChartJS.register(ArcElement, Tooltip, Legend);

const ReportsYear = () => {
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [issueCounts, setIssueCounts] = useState({});
  const printRef = useRef(null);
  const [selectedQuarter, setSelectedQuarter] = useState(null);
  const navigate = useNavigate();
  const yearlyChartRef = useRef(null);
  const quarterlyChartRef = useRef(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get("http://192.168.1.3:5000/api/year/get-year");
        const years = res.data;
        setAvailableYears(years);

        if (years.length > 0) {
          const latestYear = years.reduce((a, b) => (a.year > b.year ? a : b));
          setSelectedYear(latestYear.year);
          handleYearSelect(latestYear.id, latestYear.year);
          setSelectedQuarter("Q1");
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
  }, []);

  const handleYearSelect = async (yearId, yearValue) => {
    setSelectedYear(yearValue);
    setMonitoringData([]);
    setIssueCounts({});

    try {
      const monthsRes = await axios.get(
        `http://192.168.1.3:5000/api/month/getByYear/${yearId}`
      );
      const months = monthsRes.data;

      const combinedData = [];
      const issueCounter = {};

      for (const month of months) {
        const res = await axios.get(
          `http://192.168.1.3:5000/api/year/get-request/${month.id}`
        );
        const data = res.data;
        combinedData.push(...data);

        data.forEach((item) => {
          const issue = item.issue;
          issueCounter[issue] = (issueCounter[issue] || 0) + 1;
        });
      }

      setMonitoringData(combinedData);
      setIssueCounts(issueCounter);
    } catch (error) {
      console.error("Error loading year data:", error);
    }
  };

  const pieData = {
    labels: Object.keys(issueCounts),
    datasets: [
      {
        label: "Number of Issues",
        data: Object.values(issueCounts),
        backgroundColor: [
          "#FF6384", // red-pink
          "#36A2EB", // blue
          "#FFCE56", // yellow
          "#4BC0C0", // teal
          "#9966FF", // purple
          "#FF9F40", // orange
          "#00A86B", // jade green
          "#8A2BE2", // blue violet
          "#FFD700", // gold
          "#DC143C", // crimson
          "#FF69B4", // hot pink
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
        color: "#1f2937",
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
    navigate("/print-Yearly-Report", {
      state: {
        year: selectedYear,
        tableData: monitoringData,
        issueCounts: issueCounts,
      },
    });
  };

  const handlePrintQuarterly = () => {
    navigate("/print-Quarterly-Report", {
      state: {
        year: selectedYear,
        quarter: selectedQuarter,
        tableData: getQuarterData(
          monitoringData,
          selectedYear,
          selectedQuarter
        ),
        issueCounts: getQuarterData(
          monitoringData,
          selectedYear,
          selectedQuarter
        ).reduce((acc, item) => {
          const issue = item.issue;
          acc[issue] = (acc[issue] || 0) + 1;
          return acc;
        }, {}),
      },
    });
  };

  const quarterMonths = {
    Q1: [0, 1, 2],
    Q2: [3, 4, 5],
    Q3: [6, 7, 8],
    Q4: [9, 10, 11],
  };

  const getQuarterData = (data, selectedYear, selectedQuarter) => {
    const months = quarterMonths[selectedQuarter];
  
    return data.filter((entry) => {
      const date = new Date(entry.createdAt); // or updatedAt if needed
      return (
        date.getFullYear() === selectedYear &&
        months.includes(date.getMonth())
      );
    });
  };

  const exportToExcelWithChart = async (
    filename,
    data,
    issueData,
    canvasElement
  ) => {
    if (!canvasElement) return;

    const canvasImage = await html2canvas(canvasElement);
    const chartDataUrl = canvasImage.toDataURL("image/png");

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

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
      { header: "Issue", key: "issue", width: 20 },
      { header: "Occurrences", key: "occurrences", width: 15 },
      { header: "Requested By", key: "requestedby", width: 20 },
      { header: "Workgroup", key: "workgroup", width: 15 },
      { header: "Repair Done", key: "repairDone", width: 25 },
      { header: "Service By", key: "serviceby", width: 20 },
      { header: "Date Requested", key: "createdAt", width: 25 },
      { header: "Date Accomplished", key: "updatedAt", width: 25 },
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

    data.forEach((item) => {
      worksheet.addRow([
        item.issue,
        issueData[item.issue] || "",
        item.requestedby,
        item.workgroup,
        item.repairDone,
        item.serviceby,
        new Date(item.createdAt).toLocaleString(),
        new Date(item.updatedAt).toLocaleString(),
      ]);
    });

    const imageId = workbook.addImage({
      base64: chartDataUrl,
      extension: "png",
    });

    worksheet.addImage(imageId, {
      tl: { col: 9, row: 1 },
      ext: { width: 400, height: 300 },
    });

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${filename}.xlsx`);
  };

  //CONVERT TO EXCEL YEARLY
  const exportToExcelWithChartYearly = () => {
    exportToExcelWithChart(
      `Yearly_Report_${selectedYear}`,
      monitoringData,
      issueCounts,
      yearlyChartRef.current
    );
  };

  //CONVERT TO EXCEL QUARTERLY
  const exportToExcelWithChartQuarterly = () => {
    const quarterData = getQuarterData(
      monitoringData,
      selectedYear,
      selectedQuarter
    );
    const quarterIssueCounts = quarterData.reduce((acc, item) => {
      acc[item.issue] = (acc[item.issue] || 0) + 1;
      return acc;
    }, {});

    exportToExcelWithChart(
      `Quarterly_Report_${selectedYear}_${selectedQuarter}`,
      quarterData,
      quarterIssueCounts,
      quarterlyChartRef.current
    );
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="bg-slate-50 p-8 shadow-md text-center select-none rounded-xl">
        <h1 className="text-2xl font-semibold font-montserrat">
          Summary Yearly Report
        </h1>
        <div className="mt-4">
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Select Year:{" "}
          </label>
          <select
            id="year"
            onChange={(e) => {
              const selected = availableYears.find(
                (y) => y.year === parseInt(e.target.value)
              );
              if (selected) handleYearSelect(selected.id, selected.year);
            }}
            className="mt-1 block w-52 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">-- Choose Year --</option>
            {availableYears.map((year) => (
              <option key={year.id} value={year.year}>
                {year.year}
              </option>
            ))}
          </select>
        </div>
        {selectedYear && (
          <div ref={printRef}>
            <div className="flex justify-end mb-4 mt-20 gap-2">
              <button
                onClick={handlePrint}
                className="bg-gray-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-gray-700 transition duration-300"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={exportToExcelWithChartYearly}
                className="bg-green-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-green-700 transition duration-300"
              >
                <FaRegFileExcel size={16} />
                Excel
              </button>
            </div>
            <h2 className="text-2xl font-montserrat">
              Summary for {selectedYear}
            </h2>

            <div className="w-full md:w-[30rem] mx-auto mt-10 mb-10">
              <h2 className="text-lg font-semibold font-montserrat mb-4">
                Number of Issues Occurrence (Pie Chart)
              </h2>
              <Pie
                ref={(el) => {
                  yearlyChartRef.current = el?.canvas;
                }}
                data={pieData}
                options={pieChartOptions}
                plugins={[ChartDataLabels]}
              />
            </div>

            <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
              <thead>
                <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                  <th className="border py-2 px-4">Issue</th>
                  <th className="border py-2 px-4">Number of Occurrence</th>
                  <th className="border py-2 px-4">Name of User</th>
                  <th className="border py-2 px-4">Control No.</th>
                  <th className="border py-2 px-4">Workgroup</th>
                  <th className="border py-2 px-4">Repair Done</th>
                  <th className="border py-2 px-4">Service By</th>
                  <th className="border py-2 px-4">Date Requested</th>
                  <th className="border py-2 px-4">Date Accomplished</th>
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
                        className="even:bg-slate-100 border-t hover:bg-gray-300 transition duration-300 text-center"
                      >
                        <td className="py-1 px-2">
                          {index === 0 ? issue : ""}
                        </td>
                        <td className="py-1 px-2">
                          {index === 0 ? items.length : ""}
                        </td>
                        <td className="py-1 px-2">{item.requestedby}</td>
                        <td className="py-1 px-2">{item.workgroup}</td>
                        <td className="py-1 px-2">{item.controlno}</td>
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
        )}
      </div>

      <div className="bg-slate-50 p-8 rounded-xl shadow-md">
        <div>
          <h2 className="text-xl font-semibold font-montserrat mt-10 text-center">
            Summary for {selectedQuarter} of {selectedYear}
          </h2>
          {["Q1", "Q2", "Q3", "Q4"].map((qtr, i) => (
            <button
              key={qtr}
              className={`h-12 px-4 rounded-t-xl ${
                selectedQuarter === qtr
                  ? "bg-slate-200 text-gray-600"
                  : "bg-white"
              }`}
              onClick={() => setSelectedQuarter(qtr)}
            >
              {`Quarter ${i + 1}`}
            </button>
          ))}
        </div>
        <div className="bg-slate-200 rounded-r-xl rounded-b-xl p-6">
          <div className="bg-white p-10 rounded-xl">
            <div className="flex justify-end gap-2">
              <button
                onClick={handlePrintQuarterly}
                className="bg-gray-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-gray-700 transition duration-300"
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={exportToExcelWithChartQuarterly}
                className="bg-green-800 text-white rounded px-4 py-2 font-montserrat flex gap-2 items-center hover:bg-green-700 transition duration-300"
              >
                <FaRegFileExcel size={16} />
                Excel
              </button>
            </div>

            {selectedQuarter && selectedYear && (
              <>
                {/* Quarter Pie Chart */}
                <div
                  ref={printRef}
                  className="w-full md:w-[30rem] mx-auto mt-6 mb-10 font-montserrat"
                >
                  <Pie
                    ref={(el) => {
                      quarterlyChartRef.current = el?.canvas;
                    }}
                    data={{
                      labels: Object.keys(
                        getQuarterData(
                          monitoringData,
                          selectedYear,
                          selectedQuarter
                        ).reduce((acc, cur) => {
                          acc[cur.issue] = (acc[cur.issue] || 0) + 1;
                          return acc;
                        }, {})
                      ),
                      datasets: [
                        {
                          label: "Number of Issues",
                          data: Object.values(
                            getQuarterData(
                              monitoringData,
                              selectedYear,
                              selectedQuarter
                            ).reduce((acc, cur) => {
                              acc[cur.issue] = (acc[cur.issue] || 0) + 1;
                              return acc;
                            }, {})
                          ),
                          backgroundColor: [
                            "#FF6384", // red-pink
                            "#36A2EB", // blue
                            "#FFCE56", // yellow
                            "#4BC0C0", // teal
                            "#9966FF", // purple
                            "#FF9F40", // orange
                            "#00A86B", // jade green
                            "#8A2BE2", // blue violet
                            "#FFD700", // gold
                            "#DC143C", // crimson
                            "#FF69B4", // hot pink
                          ],
                        },
                      ],
                    }}
                    options={pieChartOptions}
                    plugins={[ChartDataLabels]}
                  />
                </div>

                {/* Quarter Table */}
                <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
                  <thead>
                    <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                      <th className="border py-2 px-4">Issue</th>
                      <th className="border py-2 px-4">Number of Occurrence</th>
                      <th className="border py-2 px-4">Name of User</th>
                      <th className="border py-2 px-4">Workgroup</th>
                      <th className="border py-2 px-4">Control No.</th>
                      <th className="border py-2 px-4">Repair Done</th>
                      <th className="border py-2 px-4">Service By</th>
                      <th className="border py-2 px-4">Date Requested</th>
                      <th className="border py-2 px-4">Date Accomplished</th>
                    </tr>
                  </thead>
                  <tbody className="font-montserrat">
                    {getQuarterData(
                      monitoringData,
                      selectedYear,
                      selectedQuarter
                    ).length > 0 ? (
                      Object.entries(
                        getQuarterData(
                          monitoringData,
                          selectedYear,
                          selectedQuarter
                        ).reduce((acc, item) => {
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
                            <td className="py-1 px-2">{item.workgroup}</td>
                            <td className="py-1 px-2">{item.controlno}</td>
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
                          </tr>
                        ))
                      )
                    ) : (
                      <tr>
                        <td colSpan="8" className="border p-2 text-center">
                          No monitoring data for {selectedQuarter}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsYear;

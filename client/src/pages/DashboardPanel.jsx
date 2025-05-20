import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { FilePen, Loader, Hourglass, ListTodo } from "lucide-react";
import Swal from 'sweetalert2';



ChartJS.register(ArcElement, Tooltip, Legend);

const DashboardPanel = ({ setActivePanel }) => {
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [issueCounts, setIssueCounts] = useState({});

  const [monitoring, setMonitoring] = useState([]);
  const [lastRequestId, setLastRequestId] = useState(null);

  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/year/get-year");
        const years = res.data;
        setAvailableYears(years);

        if (years.length > 0) {
          const latestYear = years.reduce((a, b) => (a.year > b.year ? a : b));
          setSelectedYear(latestYear.year);
          handleYearSelect(latestYear.id, latestYear.year);
        }
      } catch (error) {
        console.error("Error fetching years:", error);
      }
    };

    fetchYears();
    
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMonitoring();
    }, 5000); // every 10 seconds
  
    return () => clearInterval(interval); // cleanup
  }, [lastRequestId]);

  const handleYearSelect = async (yearId, yearValue) => {
    setSelectedYear(yearValue);
    setMonitoringData([]);
    setIssueCounts({});

    try {
      const monthsRes = await axios.get(
        `http://localhost:5000/api/month/getByYear/${yearId}`
      );
      const months = monthsRes.data;

      const combinedData = [];
      const issueCounter = {};

      for (const month of months) {
        const res = await axios.get(
          `http://localhost:5000/api/year/get-request/${month.id}`
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

  //------------FETCH REQUEST------------
  const fetchMonitoring = async () => {
    try {
      const limit = 100;
      const offset = 0;
  
      const res = await axios.get("http://localhost:5000/api/year/get-all-softrequest", {
        params: { limit, offset },
      });
  
      const sortedRequests = res.data.data.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
  
      // Check if a new request is added
      if (sortedRequests.length > 0 && lastRequestId && sortedRequests[0].id !== lastRequestId) {
        Swal.fire({
          title: "New Request Detected!",
          icon: "warning",
          confirmButtonText: "OK"
        });
      }
  
      setLastRequestId(sortedRequests[0]?.id || null);
      setMonitoring(sortedRequests);
    } catch (error) {
      console.error("Error Fetching Request:", error);
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
          "#00A86B",
          "#8A2BE2",
          "#FFD700",
          "#DC143C",
          "#FF69B4",
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

  const pendingCount = monitoring.filter(
    (request) => request.status === "Pending"
  ).length;
  const completedCount = monitoring.filter(
    (request) => request.status === "Completed"
  ).length;
  const inprogressCount = monitoring.filter(
    (request) => request.status === "In Progress"
  ).length;

  return (
    <div className="select-none">
      <div className="bg-slate-50 p-6 mb-10 rounded-xl shadow-sm w-full">
        {/* Header */}

        <h2 className="text-2xl font-bold text-gray-800 font-montserrat mb-10">
          Dashboard Overview
        </h2>
      
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div  onClick={() => setActivePanel("managerequest")} className="bg-gray-200 text-gray-700 cursor-pointer p-4 rounded-lg shadow-sm border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-montserrat">
              Total Request
            </h3>
            <p className="text-2xl font-bold">{monitoring.length}</p>
          </div>
          <div>
            <FilePen size={50} />
          </div>
        </div>
        <div onClick={() => setActivePanel("managerequest")} className="bg-red-100 cursor-pointer text-red-600 p-4 rounded-lg shadow-sm border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-montserrat">
              Pending Request
            </h3>
            <p className="text-2xl font-bold">{pendingCount}</p>
          </div>
          <div>
            <Loader size={50} />
          </div>
        </div>
        <div onClick={() => setActivePanel("managerequest")} className="bg-green-100 cursor-pointer text-green-600 p-4 rounded-lg shadow-sm border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-montserrat">
              Completed Request
            </h3>
            <p className="text-2xl font-bold">{completedCount}</p>
          </div>
          <div>
            <ListTodo size={50} />
          </div>
        </div>
        <div onClick={() => setActivePanel("managerequest")} className="bg-yellow-100 cursor-pointer text-yellow-700 p-4 rounded-lg shadow-sm border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold font-montserrat">
              In Progress Request
            </h3>
            <p className="text-2xl font-bold">{inprogressCount}</p>
          </div>
          <div>
            <Hourglass size={50} />
          </div>
        </div>
      </div>
      </div>

      {/* Chart + Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border select-none">
        <h1 className="text-2xl font-montserrat font-semibold text-center">
          Summary for the Year {selectedYear ? selectedYear : "..."}
        </h1>
        <div className="w-full md:w-[30rem] mx-auto mt-10 mb-10">
          <Pie
            data={pieData}
            options={pieChartOptions}
            plugins={[ChartDataLabels]}
          />
        </div>

        {/* Table */}
        <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
          <thead>
            <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
              <th className="border py-2 px-4">Issue</th>
              <th className="border py-2 px-4">Number of Occurrence</th>
              <th className="border py-2 px-4">Requested By</th>
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
                    <td className="py-1 px-2">{index === 0 ? issue : ""}</td>
                    <td className="py-1 px-2">
                      {index === 0 ? items.length : ""}
                    </td>
                    <td className="py-1 px-2">{item.requestedby}</td>
                    <td className="py-1 px-2">{item.controlno}</td>
                    <td className="py-1 px-2">{item.workgroup}</td>
                    <td className="py-1 px-2">{item.repairDone}</td>
                    <td className="py-1 px-2">{item.serviceby}</td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(item.createdAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </span>
                    </td>
                    <td className="py-1 px-2 whitespace-nowrap">
                      {new Date(item.updatedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "2-digit",
                      })}
                      <br />
                      <span className="text-xs text-gray-500">
                        {new Date(item.updatedAt).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
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
    </div>
  );
};

export default DashboardPanel;

import React, { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import LOGO from "../assets/NDC.png";

ChartJS.register(ArcElement, Tooltip, Legend);

const PrintPanelYear = () => {
  const { state } = useLocation();
  const printRef = useRef(null);

  useEffect(() => {
    setTimeout(() => {
      window.print();
    }, 1500); // Delay to ensure chart/table renders (5 seconds)
  }, []);

  if (!state) return <div>No data to print.</div>;

  const { year, tableData, issueCounts } = state;

  // Group tableData by issue
  const groupedByIssue = tableData.reduce((acc, item) => {
    if (!acc[item.issue]) acc[item.issue] = [];
    acc[item.issue].push(item);
    return acc;
  }, {});

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

  return (
    <div ref={printRef} className="p-10 font-montserrat">
      <div className="flex justify-center">
        <img src={LOGO} alt="NDC-Logo" className="h-40 w-40" />
      </div>
      <h1 className="text-2xl font-bold text-center mb-6 font-montserrat">
        Summary Report for the Year – {year}
      </h1>

      {Object.keys(issueCounts).length > 0 && (
        <div className="flex justify-center my-10 print:justify-center">
          <div className="w-[30rem]">
            <h2 className="text-lg font-semibold text-center mb-4">
              Number of Issue Occurrences
            </h2>
            <Pie
              data={pieData}
              options={pieChartOptions}
              plugins={[ChartDataLabels]}
            />
          </div>
        </div>
      )}

      <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
        <thead>
          <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
            <th className="border px-4 py-2">Issue</th>
            <th className="border px-4 py-2">Number of Occurrence</th>
            <th className="border px-4 py-2">Requested By</th>
            <th className="border px-4 py-2">Workgroup</th>
            <th className="border px-4 py-2">Repair Done</th>
            <th className="border px-4 py-2">Service By</th>
            <th className="border px-4 py-2">Date Requested</th>
            <th className="border px-4 py-2">Date Accomplished</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(groupedByIssue).map(([issue, items]) =>
            items.map((item, index) => (
              <tr
                key={item.id + "-" + index}
                className="even:bg-slate-100 hover:bg-gray-100 transition"
              >
                <td className="py-1 px-2">{index === 0 ? issue : ""}</td>
                <td className="py-1 px-2">{index === 0 ? items.length : ""}</td>
                <td className="px-2 py-1">{item.requestedby}</td>
                <td className="px-2 py-1">{item.workgroup}</td>
                <td className="px-2 py-1">{item.repairDone}</td>
                <td className="px-2 py-1">{item.serviceby}</td>
                <td className="py-1 px-2">
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
                      hour12: "true",
                    })}
                  </span>
                </td>
                <td className="py-1 px-2 ">
                  {new Date(item.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  })}
                  <br />
                  <span className="py-1 px-2">
                  {new Date(item.updatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: "true",
                  })}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PrintPanelYear;

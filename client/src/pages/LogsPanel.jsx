import React, { useEffect, useState } from "react";
import axios from "axios";
import { ArrowDownUp, Search } from "lucide-react";

const LogsPanel = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  //---FILTER---
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, []);

  //------------FETCH LOGS------------
  const fetchLogs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/logs/get");
      setLogs(res.data);
    } catch (error) {
      console.error("Error Fetching Logs:", error);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-4 font-montserrat flex items-center gap-2 text-gray-800">
        Logs Entries
      </h1>

      {/* Search Bar */}
      <div className="flex items-center gap-2 justify-end mb-4">
        <Search size={22} className="text-gray-500" />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-64 border border-gray-300 p-2 rounded-md shadow-sm "
        />
      </div>
      <div className="flex justify-start gap-2">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-60 border p-2 rounded mb-4 text-gray-500"
        >
          <option value="">---Action---</option>
          <option value="DELETE">DELETE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="CREATE">CREATE</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm text-center">
          <thead>
            <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
              <th className="py-2 px-4">Actions</th>
              <th className="py-2 px-4">Details</th>
              <th className="py-2 px-4">User</th>
              <th className="py-2 px-4">Action Time</th>
            </tr>
          </thead>
          <tbody className="font-montserrat">
            {logs
              .filter((log) => {
                const search = searchTerm.toLowerCase();
                const matchesSearch =
                  !searchTerm ||
                  log.action?.toLowerCase().includes(search) ||
                  log.details?.toLowerCase().includes(search) ||
                  log.user?.toLowerCase().includes(search);

                const matchesAction =
                  !actionFilter || log.action === actionFilter;

                return matchesSearch && matchesAction;
              })
              .map((log) => (
                <tr
                  key={log.id}
                  className="even:bg-slate-100 hover:bg-gray-100 transition"
                >
                  <td
                    className={`py-1 px-2 font-semibold ${
                      log.action === "CREATE"
                        ? "text-green-600"
                        : log.action === "UPDATE"
                        ? "text-blue-600"
                        : log.action === "DELETE"
                        ? "text-red-600"
                        : "text-gray-600"
                    }`}
                  >
                    {log.action}
                  </td>
                  <td className="py-1 px-2">{log.details}</td>
                  <td className="py-1 px-2">{log.user}</td>
                  <td className="px-2 py-1 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}

                    <br />
                    <span className="text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogsPanel;

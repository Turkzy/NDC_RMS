import React, { useState, useEffect } from "react";
import api, { endpoints } from "../config/api";
import { Search, AlertCircle } from "lucide-react";

const Actionlogs = () => {
  const [actionlogs, setActionlogs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionFilter, setActionFilter] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;

  // ===== Details formatting helpers =====
  const splitLines = (text) =>
    (text || "").replace(/\r\n/g, "\n").split("\n").filter(Boolean);

  const parseLogDetails = (details) => {
    const lines = splitLines(details);
    if (lines.length === 0) return { bullets: [] };
    // Remove "- " prefix if present, otherwise use line as-is
    const bullets = lines
      .map((l) => l.replace(/^\s*-\s*/, "").trim())
      .filter(Boolean);
    return { bullets };
  };

  const splitArrow = (text) => {
    // Supports → or -> as change arrows
    const arrowMatch = text.includes(" → ")
      ? " → "
      : text.includes(" -> ")
      ? " -> "
      : null;
    if (!arrowMatch) return null;
    const [left, right] = text.split(arrowMatch);
    return {
      left: left?.trim() ?? "",
      right: right?.trim() ?? "",
      arrow: arrowMatch,
    };
  };

  const extractLabelAndValues = (text) => {
    const idx = text.indexOf(":");
    if (idx === -1) return { label: "", valuePart: text };
    const label = text.slice(0, idx).trim();
    const valuePart = text.slice(idx + 1).trim();
    return { label, valuePart };
  };

  useEffect(() => {
    fetchActionLogs();
  }, []);

  const fetchActionLogs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      const res = await api.get(endpoints.actionlogs.getAll);
      const logs = res.data?.actionLogs || [];
      setActionlogs(
        logs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      );
    } catch (err) {
      console.error("Failed to fetch action logs:", err);
      setError("Failed to load action logs. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filtered = actionlogs.filter((log) => {
    // Filter by search term
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchesSearch =
        log.action?.toLowerCase().includes(q) ||
        log.details?.toLowerCase().includes(q);
      if (!matchesSearch) return false;
    }

    // Filter by action type
    if (actionFilter) {
      if (log.action !== actionFilter) return false;
    }

    return true;
  });

  const actionOptions = [...new Set(actionlogs.map((log) => log.action))]
    .filter(Boolean)
    .map((action) => ({
      value: action,
      label: action,
    }));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const renderBullet = (bullet, i) => {
    const { label, valuePart } = extractLabelAndValues(bullet);
    const diff = splitArrow(valuePart);

    return (
      <li key={i} className="flex items-start gap-2 py-0.5">
        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
        <div className="text-sm leading-5 text-gray-700 break-words">
          {label && (
            <span className="font-semibold text-gray-800 ">{label}: </span>
          )}
          {diff ? (
            <>
              <span className="text-red-600 dark:text-red-400 mr-1">
                {diff.left.replace(/^\"|\"$/g, "")}
              </span>
              <span className="text-gray-400">→</span>
              <span className="ml-1 text-green-700 dark:text-green-300 font-medium">
                {diff.right.replace(/^\"|\"$/g, "")}
              </span>
            </>
          ) : (
            <span>{valuePart || bullet}</span>
          )}
        </div>
      </li>
    );
  };

  const renderDetails = (log) => {
    const { bullets } = parseLogDetails(log.details || "");
    const isExpanded = !!expanded[log.id];

    if (bullets.length === 0) {
      return (
        <span className="text-sm text-gray-400 dark:text-gray-500">
          No details
        </span>
      );
    }

    const toggle = () => setExpanded((s) => ({ ...s, [log.id]: !isExpanded }));

    return (
      <div className="border-b border-gray-200 dark:border-gray-700">
        {/* Accordion header */}
        <button
          type="button"
          onClick={toggle}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
            {isExpanded ? "Hide details" : "Show details"}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : "rotate-0"
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 10.167l3.71-2.936a.75.75 0 111.04 1.08l-4.24 3.36a.75.75 0 01-.94 0l-4.24-3.36a.75.75 0 01-.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {/* Animated panel */}
        <div
          className={`transition-[max-height] duration-300 ease-in-out overflow-hidden ${
            isExpanded ? "max-h-96" : "max-h-0"
          }`}
        >
          <ul className="pl-3 pr-3 pb-2 pt-1">{bullets.map(renderBullet)}</ul>
        </div>
      </div>
    );
  };

  return (
    <div className="select-none p-4">
      <h1 className="text-3xl font-semibold text-gray-600 font-montserrat mb-8 text-center uppercase">
        Actionlogs
      </h1>

      {/* Filters and Search */}
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center flex-1">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 "
            />
          </div>

          {/* Filter by Action */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 bg-white text-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">--All Actions--</option>
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <AlertCircle className="mx-auto text-red-500 w-12 h-12 mb-2" />
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchActionLogs}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Retry
          </button>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto mb-4 ">
            <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-slate-300 font-montserrat text-sm text-gray-800 sticky top-0 z-10">
                  <th className="py-2 px-4">Date Created</th>
                  <th className="py-2 px-4">Action</th>
                  <th className="py-2 px-4">Details</th>
                </tr>
              </thead>
              <tbody className="text-center">
                {pageItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="3"
                      className="py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No logs found
                    </td>
                  </tr>
                ) : (
                  pageItems.map((log) => (
                    <tr
                      key={log.id}
                      className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-4 py-2 whitespace-nowrap align-middle">
                        {new Date(log.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                        })}
                        <br />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(log.createdAt).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </span>
                      </td>
                      <td className="py-2 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            (log.action || "").toLowerCase().includes("delete")
                              ? "bg-red-100 dark:bg-red-900 text-red-800"
                              : (log.action || "")
                                  .toLowerCase()
                                  .includes("create")
                              ? "bg-green-100 dark:bg-green-900 text-green-800"
                              : "bg-blue-100 dark:bg-blue-900 text-blue-800"
                          }`}
                        >
                          {log.action || "N/A"}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-gray-700 max-w-[40rem] text-left">
                        {renderDetails(log)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300 font-montserrat">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Actionlogs;

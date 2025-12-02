import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  ClipboardList,
  Clock4,
} from "lucide-react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Doughnut, Bar } from "react-chartjs-2";
import api, { endpoints } from "../config/api";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const DEFAULT_STATUS_COLORS = {
  Pending: "#f97316",
  "In Progress": "#facc15",
  Completed: "#22c55e",
  default: "#94a3b8",
};

const Dashboard = () => {
  const [concerns, setConcerns] = useState([]);
  const [locations, setLocations] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState("30"); // days

  useEffect(() => {
    const fetchDashboardData = async () => {
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
        console.error("Failed to load dashboard data", err);
        setError("Unable to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
    const match =
      items.find((item) => String(item.id) === String(value)) || {};
    return match.itemName || value || "Other";
  };

  const filteredConcerns = useMemo(() => {
    if (timeRange === "all") return concerns;
    const cutoff = Date.now() - Number(timeRange) * 24 * 60 * 60 * 1000;
    return concerns.filter((concern) => {
      const created = new Date(concern.createdAt).getTime();
      return Number.isNaN(created) ? true : created >= cutoff;
    });
  }, [concerns, timeRange]);

  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, "In Progress": 0, Completed: 0 };
    concerns.forEach((concern) => {
      const status = concern.status || "Pending";
      counts[status] = (counts[status] || 0) + 1;
    });
    counts.Total = concerns.length;
    return counts;
  }, [concerns]);

  const averageCompletionTime = useMemo(() => {
    const completed = concerns.filter(
      (concern) => (concern.status || "").toLowerCase() === "completed"
    );
    if (!completed.length) return "--";
    const totalHours = completed.reduce((sum, concern) => {
      const start = new Date(concern.createdAt).getTime();
      const end = new Date(concern.updatedAt || concern.createdAt).getTime();
      if (Number.isNaN(start) || Number.isNaN(end)) return sum;
      return sum + Math.max(0, end - start);
    }, 0);
    const avgMs = totalHours / completed.length;
    const hours = avgMs / (1000 * 60 * 60);
    return `${hours.toFixed(1)} hrs`;
  }, [concerns]);

  const recentConcerns = useMemo(() => {
    return [...concerns]
      .sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [concerns]);

  const statusChartData = useMemo(() => {
    const labels = ["Pending", "In Progress", "Completed"];
    const data = labels.map((status) => statusCounts[status] || 0);
    return {
      labels,
      datasets: [
        {
          label: "Concerns",
          data,
          backgroundColor: labels.map(
            (label) => DEFAULT_STATUS_COLORS[label] || DEFAULT_STATUS_COLORS.default
          ),
          borderWidth: 2,
        },
      ],
    };
  }, [statusCounts]);

  const locationChartData = useMemo(() => {
    const counts = filteredConcerns.reduce((acc, concern) => {
      const key = getLocationLabel(concern.location);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const sortedEntries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    return {
      labels: sortedEntries.map(([label]) => label),
      datasets: [
        {
          label: "Concerns",
          data: sortedEntries.map(([, count]) => count),
          backgroundColor: "#2563eb",
          borderRadius: 12,
          barThickness: 26,
        },
      ],
    };
  }, [filteredConcerns, locations]);

  const maintenanceDistribution = useMemo(() => {
    const counts = filteredConcerns.reduce((acc, concern) => {
      const key = getItemLabel(concern.item);
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const entries = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    return entries;
  }, [filteredConcerns, items]);

  const statCards = [
    {
      label: "Total Concerns",
      value: statusCounts.Total || 0,
      icon: ClipboardList,
      accent: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: statusCounts.Pending || 0,
      icon: Clock4,
      accent: "bg-amber-100 text-amber-600",
    },
    {
      label: "In Progress",
      value: statusCounts["In Progress"] || 0,
      icon: Activity,
      accent: "bg-indigo-100 text-indigo-600",
    },
    {
      label: "Completed",
      value: statusCounts.Completed || 0,
      icon: CheckCircle,
      accent: "bg-emerald-100 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-emerald-500">
              Maintenance Overview
            </p>
            <h1 className="text-3xl font-bold text-slate-800 mt-2">Dashboard</h1>
            <p className="text-sm text-slate-500">
              Monitor incoming concerns, workload, and progress at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="all">All time</option>
            </select>
          </div>
        </header>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center text-slate-500">
            Loading dashboard data...
          </div>
        ) : (
          <>
            {/* Stat cards */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {statCards.map(({ label, value, icon: Icon, accent }) => (
                <article
                  key={label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      {label}
                    </p>
                    <span className={`rounded-full p-2 ${accent}`}>
                      <Icon size={18} />
                    </span>
                  </div>
                  <p className="mt-4 text-3xl font-semibold text-slate-800">
                    {value}
                  </p>
                </article>
              ))}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 xl:col-span-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Avg. Completion Time
                    </p>
                    <p className="mt-2 text-3xl font-semibold text-slate-800">
                      {averageCompletionTime}
                    </p>
                  </div>
                  <div className="rounded-full bg-rose-100 p-3 text-rose-600">
                    <AlertTriangle size={22} />
                  </div>
                </div>
              </article>
            </section>

            {/* Charts */}
            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Status Distribution
                    </p>
                    <p className="text-sm text-slate-400">
                      Breakdown of concerns by status
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-72">
                  {statusCounts.Total ? (
                    <Doughnut
                      data={statusChartData}
                      options={{
                        plugins: {
                          legend: {
                            position: "bottom",
                            labels: { usePointStyle: true },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      No data to display yet.
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Top Locations
                    </p>
                    <p className="text-sm text-slate-400">
                      Locations with the most concerns ({timeRange === "all"
                        ? "all time"
                        : `last ${timeRange} days`}
                      )
                    </p>
                  </div>
                </div>
                <div className="mt-6 h-72">
                  {locationChartData.labels.length ? (
                    <Bar
                      data={locationChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          x: {
                            ticks: { font: { size: 10 } },
                            grid: { display: false },
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { precision: 0 },
                            grid: { color: "#e2e8f0" },
                          },
                        },
                      }}
                    />
                  ) : (
                    <p className="text-center text-sm text-slate-500">
                      No data to display yet.
                    </p>
                  )}
                </div>
              </article>
            </section>

            {/* Maintenance distribution & recent */}
            <section className="grid gap-6 lg:grid-cols-2">
              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Maintenance Types
                  </p>
                  <p className="text-sm text-slate-400">
                    Top requests for selected timeframe
                  </p>
                </div>
                <div className="mt-6 space-y-4">
                  {maintenanceDistribution.length ? (
                    maintenanceDistribution.map(([label, count]) => {
                      const percentage =
                        filteredConcerns.length > 0
                          ? ((count / filteredConcerns.length) * 100).toFixed(1)
                          : "0.0";
                      return (
                      <div
                        key={label}
                        className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-700">
                            {label}
                          </p>
                          <p className="text-xs text-slate-500">
                            {percentage}% of requests
                          </p>
                        </div>
                        <span className="text-lg font-semibold text-slate-900">
                          {count}
                        </span>
                      </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-slate-500">
                      No activity in this time range.
                    </p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-slate-500">
                    Recent Activity
                  </p>
                  <p className="text-sm text-slate-400">
                    Latest concerns received
                  </p>
                </div>
                <div className="mt-4 divide-y divide-slate-100">
                  {recentConcerns.length ? (
                    recentConcerns.map((concern) => (
                      <div
                        key={concern.id}
                        className="flex flex-col gap-1 py-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800">
                            {concern.controlNumber || "—"}
                          </p>
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                              concern.status === "Completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : concern.status === "In Progress"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {concern.status || "Pending"}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          {concern.description || "No description provided"}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{getLocationLabel(concern.location)}</span>
                          <span>•</span>
                          <span>
                            {new Date(concern.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">Nothing yet.</p>
                  )}
                </div>
              </article>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
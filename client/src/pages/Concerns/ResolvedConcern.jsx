import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  CircleCheck,
  TriangleAlert,
  ChevronDown,
} from "lucide-react";
import api, { FILE_BASE_URL, endpoints } from "../../config/api.js";

const ResolvedConcern = () => {
  // State management
  const [itemsList, setItemsList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [levelOfRepair, setLevelOfRepair] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [editingConcern, setEditingConcern] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");
        await Promise.all([fetchItems(), fetchLocations(), fetchConcerns()]);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to load concerns. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==================== FETCH OPERATIONS ====================
  const fetchItems = async () => {
    const res = await api.get(endpoints.items.getAllItems);
    if (res.data.error === false && res.data.data) {
      setItemsList(res.data.data);
    }
  };

  const fetchLocations = async () => {
    try {
      const res = await api.get(endpoints.locations.getAllLocations);
      if (res.data.locations) {
        setLocations(res.data.locations);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
    }
  };

  const fetchConcerns = async () => {
    const res = await api.get(endpoints.concerns.getAll);
    if (Array.isArray(res.data)) {
      setConcerns(res.data);
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

  const getFileUrl = (fileName) => {
    if (!fileName) return null;
    return `${FILE_BASE_URL}${endpoints.concernfiles.getFile(fileName)}`;
  };

  const formatRemarkDate = (value) => {
    if (!value) return "--:--";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLatestRemarkText = (remarks) => {
    if (!Array.isArray(remarks) || remarks.length === 0) return "";
    return remarks[remarks.length - 1]?.body || "";
  };

  const RemarksList = ({ remarks }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!Array.isArray(remarks) || remarks.length === 0) {
      return (
        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 inline-flex items-center min-h-[60px]">
          —
        </span>
      );
    }

    const latestRemark =
      Array.isArray(remarks) && remarks.length > 0
        ? remarks[remarks.length - 1]
        : null;
    const latestPreview = (() => {
      if (!latestRemark?.body) return "—";
      const trimmed = latestRemark.body.trim();
      if (trimmed.length <= 120) return trimmed;
      return `${trimmed.slice(0, 117)}...`;
    })();

    return (
      <div className="w-full rounded-2xl border border-slate-200 bg-white text-sm text-slate-700">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
        >
          <div className="flex flex-col">
            <span className="font-medium text-slate-800 line-clamp-2">
              {latestPreview}
            </span>
            <span className="text-xs text-slate-500">
              {formatRemarkDate(latestRemark?.createdAt)}
            </span>
          </div>
          <ChevronDown
            size={18}
            className={`shrink-0 text-slate-400 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>
        {isOpen && (
          <div className="border-t border-slate-100 px-4 py-3 space-y-3">
            {remarks.map((remark, index) => (
              <div key={remark.id || `remark-${index}`}>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {remark.body || "—"}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {formatRemarkDate(remark.createdAt)}
                </p>
                {index < remarks.length - 1 && (
                  <div className="my-3 border-t border-slate-100" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const openConcernModal = (concern) => {
    setEditingConcern(concern);
    setShowConcernModal(true);
  };

  const closeConcernModal = () => {
    setShowConcernModal(false);
    setEditingConcern(null);
    setError("");
  };

  const displayedConcerns = useMemo(() => {
    return concerns
      .filter((concern) => {
        const status = concern.status?.toLowerCase();
        return status === "completed";
      })
      .filter((concern) => {
        const matchesSearch = searchTerm
          ? concern.controlNumber
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase())
          : true;

        const matchesMaintenance = maintenanceType
          ? String(concern.item) === maintenanceType ||
            concern.item === getItemLabel(maintenanceType)
          : true;

        const matchesLevel = levelOfRepair
          ? concern.levelOfRepair === levelOfRepair
          : true;

        return matchesSearch && matchesMaintenance && matchesLevel;
      });
  }, [concerns, searchTerm, maintenanceType, levelOfRepair, itemsList]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md select-none">
      <h1 className="text-3xl font-semibold uppercase text-slate-600 mt-2 text-gray-600 font-montserrat text-center mb-8">
        Resolved Concerns
      </h1>

      <div className="mb-6 p-4 flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex gap-2 items-center w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <input
              type="text"
              placeholder="Search by Control Number"
              className="border p-2 pl-10 rounded-lg w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
          </div>
          <select
            value={maintenanceType}
            onChange={(e) => setMaintenanceType(e.target.value)}
            className="w-48 border p-2 rounded-lg text-slate-600"
          >
            <option value="">--Maintenance Type--</option>
            {itemsList.map((item) => (
              <option key={item.id} value={item.id}>
                {item.itemName}
              </option>
            ))}
          </select>
          <select
            value={levelOfRepair}
            onChange={(e) => setLevelOfRepair(e.target.value)}
            className="w-48 border p-2 rounded-lg text-slate-600"
          >
            <option value="">--Level of Repair--</option>
            <option value="Minor">Minor</option>
            <option value="Major">Major</option>
            <option value="Critical/Urgent">Critical/Urgent</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-md overflow-hidden text-sm">
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
                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                  Loading concerns...
                </td>
              </tr>
            ) : displayedConcerns.length === 0 ? (
              <tr className="hover:bg-slate-50 transition">
                <td colSpan="8" className="px-4 py-4 text-center text-gray-500">
                  No resolved concerns found
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
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 border border-green-200 text-green-700">
                      <CircleCheck size={14} />
                      {concern.status || "Completed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
                        <span className="inline-flex w-full items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold bg-green-50 border-green-200 text-green-600">
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

                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Maintenance Type
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {getItemLabel(editingConcern.item) || "—"}
                        </span>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Reported By
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.reportedBy || "—"}
                        </span>
                      </div>

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
                          {editingConcern.targetDate
                            ? new Date(
                                editingConcern.targetDate
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
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
                          {editingConcern.createdAt
                            ? new Date(editingConcern.createdAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Date Accomplished
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.updatedAt
                            ? new Date(editingConcern.updatedAt).toLocaleString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )
                            : "—"}
                        </span>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Duration
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.createdAt && editingConcern.updatedAt
                            ? (() => {
                                const start = new Date(editingConcern.createdAt);
                                const end = new Date(editingConcern.updatedAt);
                                const diffTime = Math.abs(end - start);
                                const diffDays = Math.ceil(
                                  diffTime / (1000 * 60 * 60 * 24)
                                );
                                return `${diffDays} day${diffDays !== 1 ? "s" : ""}`;
                              })()
                            : "—"}
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
                        <RemarksList remarks={editingConcern.remarks} />
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
  );
};

export default ResolvedConcern;

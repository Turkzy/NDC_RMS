import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash,
  X,
  Save,
  CircleCheck,
  Clock,
  AlertCircle,
  TriangleAlert,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import api, { endpoints } from "../../config/api";
import { FaFileArrowDown, FaFileArrowUp } from "react-icons/fa6";
import Swal from "sweetalert2";
// Excel import/export helpers removed

const PendingConcern = () => {
  // State management
  const [itemsList, setItemsList] = useState([]);
  const [locations, setLocations] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [maintenanceType, setMaintenanceType] = useState("");
  const [levelOfRepair, setLevelOfRepair] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [refresh, setRefresh] = useState(false);

  // Modal states
  const [showConcernModal, setShowConcernModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit states
  const [editingConcern, setEditingConcern] = useState(null);
  
  // Remark editing states
  const [editingRemarkId, setEditingRemarkId] = useState(null);
  const [editingRemarkText, setEditingRemarkText] = useState("");

  // Form states
  const [concernForm, setConcernForm] = useState({
    description: "",
    location: "",
    endUser: "",
    reportedBy: "",
    levelOfRepair: "",
    targetDate: "",
    controlNumber: "",
    remarks: "",
    status: "Pending",
    item: "",
    fileUrl: "",
    image: null,
    updatedAt: "",
  });

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

  const fetchConcerns = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefresh(true);
      }
      const res = await api.get(endpoints.concerns.getAll);
      if (Array.isArray(res.data)) {
        setConcerns(res.data);
      }
    } catch (err) {
      console.error("Error fetching concerns:", err);
      setError("Failed to fetch concerns. Please try again.");
    } finally {
      if (isRefresh) {
        setRefresh(false);
      }
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

  const getLocationId = (value) => {
    if (!value) return "";
    const match = locations.find(
      (loc) => String(loc.id) === String(value) || loc.locationName === value
    );
    return match ? String(match.id) : value;
  };

  const getFileUrl = (fileName) => {
    if (!fileName) return null;
    const base =
      import.meta.env.VITE_API_URL?.replace("/api", "") ||
      "http://localhost:5002";
    return `${base}/concernfiles/${fileName}`;
  };

  const formatDate = (value) => {
    if (!value) return "--:--";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-US", {
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

  const getCurrentUserLabel = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return (
        parsed?.fullName ||
        parsed?.name ||
        parsed?.email ||
        parsed?.username ||
        null
      );
    } catch (err) {
      console.warn("Unable to parse stored user:", err);
      return null;
    }
  };

  const saveRemarkEntry = async (concernId, remarkText) => {
    if (!remarkText || !remarkText.trim()) return;
    try {
      const addedBy =
        getCurrentUserLabel() || concernForm.reportedBy || "System";
      await api.post(endpoints.remarks.create(concernId), {
        body: remarkText.trim(),
        addedBy,
      });
    } catch (err) {
      console.error("Failed to save remark:", err);
      Swal.fire({
        icon: "warning",
        title: "Remark not saved",
        text:
          err.response?.data?.message ||
          "Concern was saved, but adding the remark failed. Please try again.",
      });
    }
  };

  const handleUpdateRemark = async (remarkId, updatedText) => {
    if (!updatedText || !updatedText.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Invalid input",
        text: "Remark text cannot be empty.",
      });
      return;
    }

    try {
      const addedBy = getCurrentUserLabel() || "System";
      await api.put(endpoints.remarks.update(remarkId), {
        body: updatedText.trim(),
        addedBy,
      });

      // Refresh concerns to get updated remarks
      await fetchConcerns();
      
      // Update the editing concern if it's currently open
      if (editingConcern) {
        // Fetch fresh concern data
        try {
          const res = await api.get(endpoints.concerns.getById(editingConcern.id));
          if (res.data) {
            setEditingConcern(res.data);
          }
        } catch (err) {
          console.error("Failed to refresh concern:", err);
          // Fallback: find from concerns array
          const updatedConcern = concerns.find((c) => c.id === editingConcern.id);
          if (updatedConcern) {
            setEditingConcern(updatedConcern);
          }
        }
      }

      setEditingRemarkId(null);
      setEditingRemarkText("");
      
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Remark updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Failed to update remark:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update remark. Please try again.",
      });
    }
  };

  const handleDeleteRemark = async (remarkId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to delete this remark? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await api.delete(endpoints.remarks.delete(remarkId));

        // Refresh concerns to get updated remarks
        await fetchConcerns();
        
        // Update the editing concern if it's currently open
        if (editingConcern) {
          // Fetch fresh concern data
          try {
            const res = await api.get(endpoints.concerns.getById(editingConcern.id));
            if (res.data) {
              setEditingConcern(res.data);
            }
          } catch (err) {
            console.error("Failed to refresh concern:", err);
            // Fallback: find from concerns array
            const updatedConcern = concerns.find((c) => c.id === editingConcern.id);
            if (updatedConcern) {
              setEditingConcern(updatedConcern);
            }
          }
        }

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "Remark has been deleted successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Failed to delete remark:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to delete remark. Please try again.",
        });
      }
    }
  };

  const RemarksList = ({ remarks, concernId, onUpdate, onDelete, showActions = true }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [localEditingRemarkId, setLocalEditingRemarkId] = useState(null);
    const [localEditingText, setLocalEditingText] = useState("");

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

    const handleStartEdit = (remark) => {
      setLocalEditingRemarkId(remark.id);
      setLocalEditingText(remark.body || "");
    };

    const handleCancelEdit = () => {
      setLocalEditingRemarkId(null);
      setLocalEditingText("");
    };

    const handleSaveEdit = () => {
      if (onUpdate && localEditingRemarkId) {
        onUpdate(localEditingRemarkId, localEditingText);
        setLocalEditingRemarkId(null);
        setLocalEditingText("");
      }
    };

    const handleDelete = (remarkId) => {
      if (onDelete) {
        onDelete(remarkId);
      }
    };

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
              {formatDate(latestRemark?.createdAt)}
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
          <div className="border-t border-slate-200 px-4 py-4 space-y-4">
            {remarks.map((remark, index) => (
              <div key={remark.id || `remark-${index}`}>
                {localEditingRemarkId === remark.id ? (
                  // Edit mode
                  <div className="space-y-3">
                    <textarea
                      value={localEditingText}
                      onChange={(e) => setLocalEditingText(e.target.value)}
                      rows={4}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                      placeholder="Enter remark text..."
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSaveEdit}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition"
                      >
                        <Save size={14} className="inline mr-1" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
                      >
                        <X size={14} className="inline mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <div className={`flex items-start gap-4 ${showActions ? 'justify-between' : ''}`}>
                    {/* Left: Text + Date */}
                    <div className="flex-1 flex flex-col">
                      <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                        {remark.body || "—"}
                      </p>
                      <span className="text-xs text-slate-500 mt-1">
                        {formatDate(remark.createdAt)}
                      </span>
                    </div>

                    {/* Right: Actions - Only show if showActions is true */}
                    {showActions && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(remark)}
                          className="px-3 py-1.5 rounded-md text-blue-500 text-xs font-medium hover:bg-blue-50 transition flex items-center gap-1"
                          title="Edit remark"
                        >
                          <Pencil size={14} className="inline mr-1" />
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(remark.id)}
                          className="px-2 py-1 rounded-md text-xs font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition flex items-center gap-1"
                          title="Delete remark"
                        >
                          <Trash size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Divider */}
                {index < remarks.length - 1 && (
                  <div className="border-t border-slate-200 mt-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getStatusBadgeClass = (status, variant = "default") => {
    const palette = {
      Completed: {
        default: "bg-green-50 border border-green-200 text-green-600",
        soft: "bg-emerald-400/20 border border-white/30 text-white",
      },
      "In Progress": {
        default: "bg-yellow-50 border border-yellow-200 text-yellow-600",
        soft: "bg-amber-400/20 border border-white/30 text-white",
      },
      Pending: {
        default: "bg-red-50 border border-red-200 text-red-600",
        soft: "bg-rose-400/20 border border-white/30 text-white",
      },
      default: {
        default: "bg-gray-50 border border-gray-200 text-gray-600",
        soft: "bg-white/20 border border-white/30 text-white",
      },
    };

    const key = palette[status] ? status : "default";
    return palette[key][variant];
  };

  const openConcernModal = (concern) => {
    setEditingConcern(concern);
    setConcernForm({
      description: concern.description || "",
      location: getLocationId(concern.location),
      endUser: concern.endUser || "",
      reportedBy: concern.reportedBy || "",
      levelOfRepair: concern.levelOfRepair || "",
      targetDate: concern.targetDate ? concern.targetDate.split("T")[0] : "",
      controlNumber: concern.controlNumber || "",
      remarks: "",
      status: concern.status || "Pending",
      item: concern.item || "",
      fileUrl: concern.fileUrl || "",
      image: null,
      updatedAt: "",
    });
    setShowConcernModal(true);
    setIsEditing(false);
  };

  const closeConcernModal = () => {
    setShowConcernModal(false);
    setShowEditModal(false);
    setShowAddModal(false);
    setEditingConcern(null);
    setIsEditing(false);
    setConcernForm({
      description: "",
      location: "",
      endUser: "",
      reportedBy: "",
      levelOfRepair: "",
      targetDate: "",
      controlNumber: "",
      remarks: "",
      status: "Pending",
      item: "",
      fileUrl: "",
      image: null,
      updatedAt: "",
    });
    setError("");
    setSuccess("");
  };

  const openAddModal = () => {
    setConcernForm({
      description: "",
      location: "",
      endUser: "",
      reportedBy: "",
      levelOfRepair: "",
      targetDate: "",
      controlNumber: "",
      remarks: "",
      status: "Pending",
      item: "",
      fileUrl: "",
      image: null,
      updatedAt: "",
    });
    setShowAddModal(true);
    setIsEditing(false);
    setError("");
    setSuccess("");
  };

  const openEditModal = (concern) => {
    setEditingConcern(concern);
    setConcernForm({
      description: concern.description || "",
      location: getLocationId(concern.location),
      endUser: concern.endUser || "",
      reportedBy: concern.reportedBy || "",
      levelOfRepair: concern.levelOfRepair || "",
      targetDate: concern.targetDate ? concern.targetDate.split("T")[0] : "",
      controlNumber: concern.controlNumber || "",
      remarks: "",
      status: concern.status || "Pending",
      item: concern.item || "",
      fileUrl: concern.fileUrl || "",
      image: null,
      updatedAt: "",
    });
    setShowEditModal(true);
    setIsEditing(true);
  };

  const calculateTargetDate = (levelOfRepair) => {
    if (!levelOfRepair) return "";

    const today = new Date();
    let daysToAdd = 0;

    switch (levelOfRepair) {
      case "Critical/Urgent":
        daysToAdd = 3;
        break;
      case "Minor":
        daysToAdd = 5;
        break;
      case "Major":
        daysToAdd = 7;
        break;
      default:
        return "";
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);

    // Format as YYYY-MM-DD for date input
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, "0");
    const day = String(targetDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setConcernForm((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      // Automatically set targetDate when levelOfRepair changes
      if (name === "levelOfRepair") {
        updated.targetDate = calculateTargetDate(value);
      }

      return updated;
    });
  };

  const handleFileChange = (e) => {
    setConcernForm((prev) => ({
      ...prev,
      image: e.target.files[0] || null,
    }));
  };

  const handleCreateConcern = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();
      const selectedLocation = locations.find(
        (loc) => String(loc.id) === String(concernForm.location)
      );
      const locationName = selectedLocation
        ? selectedLocation.locationName
        : concernForm.location;

      submitData.append("description", concernForm.description);
      submitData.append("location", locationName);
      submitData.append("reportedBy", concernForm.reportedBy);
      submitData.append("maintenanceType", concernForm.item);
      submitData.append("endUser", concernForm.endUser || "");
      submitData.append("levelOfRepair", concernForm.levelOfRepair || "");
      submitData.append("status", concernForm.status);
      if (concernForm.targetDate) {
        submitData.append("targetDate", concernForm.targetDate);
      }

      if (concernForm.image) {
        submitData.append("file", concernForm.image);
      }

      // updatedAt should be null on creation, don't send it
      // It will only be set when the concern is updated

      const response = await api.post(endpoints.concerns.create, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.message) {
        setSuccess(response.data.message);
        const createdConcern = response.data.concern;
        if (createdConcern?.id) {
          await saveRemarkEntry(createdConcern.id, concernForm.remarks);
        }
        await fetchConcerns();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Concern created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        closeConcernModal();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create concern. Please try again."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to create concern",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateConcern = async (e) => {
    e.preventDefault();
    if (!editingConcern) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const submitData = new FormData();
      const selectedLocation = locations.find(
        (loc) => String(loc.id) === String(concernForm.location)
      );
      const locationName = selectedLocation
        ? selectedLocation.locationName
        : concernForm.location;

      submitData.append("description", concernForm.description);
      submitData.append("location", locationName);
      submitData.append("reportedBy", concernForm.reportedBy);
      submitData.append("item", concernForm.item);
      submitData.append("endUser", concernForm.endUser || "");
      submitData.append("levelOfRepair", concernForm.levelOfRepair || "");
      submitData.append("status", concernForm.status);
      if (concernForm.targetDate) {
        submitData.append("targetDate", concernForm.targetDate);
      }

      if (concernForm.image) {
        submitData.append("file", concernForm.image);
      }

      if (concernForm.updatedAt) {
        submitData.append("updatedAt", concernForm.updatedAt);
      }

      const response = await api.put(
        endpoints.concerns.update(editingConcern.id),
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.message) {
        setSuccess(response.data.message);
        await saveRemarkEntry(editingConcern.id, concernForm.remarks);
        await fetchConcerns();
        Swal.fire({
          icon: "success",
          title: "Success!",
          text: "Concern updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
        closeConcernModal();
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to update concern. Please try again."
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to update concern",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConcern = async (concern) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete this concern? This action cannot be undone!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const response = await api.delete(
          endpoints.concerns.delete(concern.id)
        );

        if (response.data.message) {
          await fetchConcerns();
          Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Concern has been deleted successfully",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.response?.data?.message || "Failed to delete concern",
        });
      }
    }
  };

  const displayedConcerns = useMemo(() => {
    return concerns
      .filter((concern) => {
        const status = concern.status?.toLowerCase();
        return status === "pending" || status === "in progress";
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
  }, [concerns, searchTerm, maintenanceType, levelOfRepair]);

  // Excel import/export helpers removed

  return (
    <div className="bg-white p-4 rounded-lg shadow-md select-none">
      <h1 className="text-3xl font-semibold text-gray-600 font-montserrat text-center mb-8">
        Pending Concerns
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
          <button
            onClick={() => fetchConcerns(true)}
            disabled={loading || refresh}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            title="Refresh concerns"
          >
            <RefreshCw className={`w-4 h-4 ${refresh ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-montserrat transform hover:scale-105 transition duration-300"
          >
            <Plus size={16} className="h-4 w-4" />
            Create Concern
          </button>
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
              <th className="px-2 py-1 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="9" className="px-4 py-4 text-center text-gray-500">
                  Loading concerns...
                </td>
              </tr>
            ) : displayedConcerns.length === 0 ? (
              <tr className="hover:bg-slate-50 transition">
                <td colSpan="9" className="px-4 py-4 text-center text-gray-500">
                  No pending concerns found
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
                    <span
                      className={
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold " +
                        (concern.status === "Completed"
                          ? "bg-green-100 border border-green-200 text-green-700"
                          : concern.status === "In Progress"
                          ? "bg-yellow-100 border border-yellow-200 text-yellow-700"
                          : "bg-red-100 border border-red-200 text-red-600")
                      }
                    >
                      {concern.status === "Completed" && (
                        <CircleCheck size={14} />
                      )}
                      {concern.status === "In Progress" && <Clock size={14} />}
                      {concern.status === "Pending" && (
                        <AlertCircle size={14} />
                      )}
                      {concern.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center flex items-center gap-2 justify-center">
                    <button
                      className="bg-blue-100 text-blue-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditModal(concern);
                      }}
                      title="Edit Concern"
                    >
                      <Pencil size={16} className="h-4 w-4" />
                    </button>
                    <button
                      className="bg-red-100 text-red-500 px-2 py-1 rounded-md text-sm font-montserrat transform hover:scale-110 transition duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteConcern(concern);
                      }}
                      title="Delete Concern"
                    >
                      <Trash size={16} className="h-4 w-4" />
                    </button>
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
                        <span
                          className={`inline-flex w-full items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold ${getStatusBadgeClass(
                            editingConcern.status
                          )}`}
                        >
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

                      {/* Maintenance Type */}
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Maintenance Type
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {getItemLabel(editingConcern.item) || "—"}
                        </span>
                      </div>

                      {/* Reported By */}
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                          Reported By
                        </label>
                        <span className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 inline-flex items-center">
                          {editingConcern.reportedBy || "—"}
                        </span>
                      </div>

                      {/* End User */}
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
                                month: "short",
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
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  hour12: true,
                                }
                              )
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
                        <RemarksList 
                          remarks={editingConcern.remarks} 
                          concernId={editingConcern.id}
                          onUpdate={handleUpdateRemark}
                          onDelete={handleDeleteRemark}
                          showActions={false}
                        />
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

      {/* Edit Modal */}
      {showEditModal && editingConcern && (
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
                      Edit Concern
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

              <div className="px-8 pb-8">
                {/* Form Column */}
                <div className="space-y-6 mt-6">
                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleUpdateConcern} className="space-y-8">
                    {/* Meta Section */}
                    <section className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                          Concern Details
                        </p>
                        <p className="text-sm text-slate-500">
                          Update the primary information for this request.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Control Number
                          </label>
                          <span
                            className={`inline-flex w-full items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold ${getStatusBadgeClass(
                              editingConcern.status
                            )}`}
                          >
                            {editingConcern.controlNumber || "—"}
                          </span>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={concernForm.description}
                            onChange={handleFormChange}
                            rows={4}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
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
                            Location <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="location"
                            value={concernForm.location}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">--Select a location--</option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.locationName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Maintenance Type */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Maintenance Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="item"
                            value={concernForm.item}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">--Select a Item--</option>
                            {itemsList.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.itemName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Reported By */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Reported By <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="reportedBy"
                            value={concernForm.reportedBy}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>

                        {/* End User */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            End User
                          </label>
                          <input
                            type="text"
                            name="endUser"
                            value={concernForm.endUser}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
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
                          <select
                            name="levelOfRepair"
                            value={concernForm.levelOfRepair}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">--Select--</option>
                            <option value="Minor">Minor</option>
                            <option value="Major">Major</option>
                            <option value="Critical/Urgent">
                              Critical/Urgent
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Status *
                          </label>
                          <select
                            name="status"
                            value={concernForm.status}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Target Date
                          </label>
                          <input
                            type="date"
                            name="targetDate"
                            value={concernForm.targetDate}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
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
                          Provide extra context or supporting files.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Existing Remarks
                          </label>
                          <RemarksList 
                            remarks={editingConcern.remarks} 
                            concernId={editingConcern.id}
                            onUpdate={handleUpdateRemark}
                            onDelete={handleDeleteRemark}
                          />
                          
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Add New Remark
                          </label>
                          <textarea
                            name="remarks"
                            value={concernForm.remarks}
                            onChange={handleFormChange}
                            rows={4}
                            placeholder="Type a new remark to append. Leave blank to keep unchanged."
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="concern-image"
                            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-600 cursor-pointer hover:border-emerald-400 transition"
                          >
                            <span className="font-semibold">
                              {concernForm.image
                                ? concernForm.image.name
                                : "Upload Image"}
                            </span>
                            <span className="text-xs text-emerald-500">
                              PNG, JPG up to 5MB
                            </span>
                          </label>
                          <input
                            type="file"
                            id="concern-image"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/jpeg, image/png, image/jpg"
                            className="hidden"
                          />
                          {concernForm.fileUrl && !concernForm.image && (
                            <div className="mt-2 space-y-2">
                              <p className="text-xs text-slate-500">
                                Current Image:
                              </p>
                              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                                <img
                                  src={getFileUrl(concernForm.fileUrl)}
                                  alt="Existing concern attachment"
                                  className="max-h-80 w-full rounded-xl object-contain"
                                  onClick={() =>
                                    window.open(
                                      getFileUrl(concernForm.fileUrl),
                                      "_blank"
                                    )
                                  }
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </section>

                    {/* Form Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={closeConcernModal}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        {submitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Concern Modal */}
      {showAddModal && (
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
                      Add Concern
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

              <div className="px-8 pb-8">
                {/* Form Column */}
                <div className="space-y-6 mt-6">
                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl">
                      {success}
                    </div>
                  )}

                  <form onSubmit={handleCreateConcern} className="space-y-8">
                    <section className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                          Concern Details
                        </p>
                        <p className="text-sm text-slate-500">
                          Provide the primary information for this request.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Description <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={concernForm.description}
                            onChange={handleFormChange}
                            rows={4}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
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
                            Where and to whom the issue applies
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Location */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Location <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="location"
                            value={concernForm.location}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">--Select a Location--</option>
                            {locations.map((location) => (
                              <option key={location.id} value={location.id}>
                                {location.locationName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Maintenance Type */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Maintenance Type{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            name="item"
                            value={concernForm.item}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">--Select a Item--</option>
                            {itemsList.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.itemName}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Reported By */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Reported By <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="reportedBy"
                            value={concernForm.reportedBy}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>

                        {/* End User */}
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            End User
                          </label>
                          <input
                            type="text"
                            name="endUser"
                            value={concernForm.endUser}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
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
                          <select
                            name="levelOfRepair"
                            value={concernForm.levelOfRepair}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="">--Select--</option>
                            <option value="Minor">Minor</option>
                            <option value="Major">Major</option>
                            <option value="Critical/Urgent">
                              Critical/Urgent
                            </option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Status *
                          </label>
                          <select
                            name="status"
                            value={concernForm.status}
                            onChange={handleFormChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Target Date
                          </label>
                          <input
                            type="date"
                            name="targetDate"
                            value={concernForm.targetDate}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                      </div>
                    </section>

                    {/* Date Information */}
                    <section className="space-y-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] font-semibold text-emerald-500">
                          timeline
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
                          <input
                            type="date"
                            name="dateReceived"
                            value={concernForm.createdAt}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Date Accomplished
                          </label>
                          <input
                            type="date"
                            name="updatedAt"
                            value={concernForm.updatedAt}
                            onChange={handleFormChange}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
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
                          Provide extra context or supporting files.
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1 block">
                            Remarks
                          </label>
                          <textarea
                            name="remarks"
                            value={concernForm.remarks}
                            onChange={handleFormChange}
                            rows={4}
                            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="concern-image"
                            className="flex items-center justify-between rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/70 px-5 py-4 text-sm text-emerald-600 cursor-pointer hover:border-emerald-400 transition"
                          >
                            <span className="font-semibold">
                              {concernForm.image
                                ? concernForm.image.name
                                : "Upload Image"}
                            </span>
                            <span className="text-xs text-emerald-500">
                              PNG, JPG up to 5MB
                            </span>
                          </label>
                          <input
                            type="file"
                            id="concern-image"
                            name="image"
                            onChange={handleFileChange}
                            accept="image/jpeg, image/png, image/jpg"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </section>

                    {/* Form Actions */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={closeConcernModal}
                        className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-6 py-3 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Plus size={18} />
                        {submitting ? "Creating..." : "Create Concern"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingConcern;

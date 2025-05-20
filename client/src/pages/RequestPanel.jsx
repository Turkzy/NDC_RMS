import React, { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import { Trash2, Pencil } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";

const RequestPanel = () => {
  const [monitoring, setMonitoring] = useState([]);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [newRequest, setNewRequest] = useState("");
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  const [editRepairDone, setEditRepairDone] = useState("");
  const [editServiceBy, setEditServiceBy] = useState("");
  const [editControlNo, setEditControlNo] = useState("");
  const [editCreatedAt, setEditCreatedAt] = useState("");
  const [editUpdatedAt, setEditUpdatedAt] = useState("");

  const [personnel, setPersonnel] = useState([]);

  //---FILTER---
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchMonitoring();
    fetchPersonnel();
  }, []);

  //------------FETCH REQUEST------------
  const fetchMonitoring = async () => {
    try {
      const limit = 100;
      const offset = 0;

      const res = await axios.get(
        "http://localhost:5000/api/year/get-all-request",
        {
          params: { limit, offset },
        }
      );

      setMonitoring(
        res.data.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
      );
    } catch (error) {
      console.error("Error Fetching Request:", error);
    }
  };

  //------------UPDATE REQUEST------------
  const handleEditRequest = async (e) => {
    e.preventDefault();
    try {
      // Format dates for backend - ensure timezone is handled properly
      const formattedCreatedAt = editCreatedAt ? new Date(editCreatedAt).toISOString() : null;
      const formattedUpdatedAt = editUpdatedAt ? new Date(editUpdatedAt).toISOString() : null;
      
      await axios.put(
        `http://localhost:5000/api/year/update-request/${selectedRequest}`,
        {
          controlno: editControlNo,
          status: editStatus,
          repairDone: editRepairDone,
          serviceby: editServiceBy,
          createdAt: formattedCreatedAt,
          updatedAt: formattedUpdatedAt,
        }
      );

      //LOGS ACTION
      await logAction("UPDATE", `Successfully Updated the Status of Request`);

      fetchMonitoring();
      setIsEditRequestModalOpen(false);
      setNewRequest("");
      toast.success(
        <div className="flex items-center gap-2">
          <Pencil className="text-green-600" />
          Updated Successfully!
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          transition: Bounce,
          icon: false,
        }
      );
    } catch (error) {
      console.error("Error Updating Request:", error);
    }
  };

  //------------FETCH IT PERSONNEL------------
  const fetchPersonnel = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/personnel/get");
      setPersonnel(res.data);
    } catch (error) {
      console.error("Error Fetching Personnels", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://localhost:5000/api/year/softdelete-request/${id}`
          );

          //LOGS ACTION
          await logAction("DELETE", `Soft Deleted the Request`);

          fetchMonitoring();
          toast.error(
            <div className="flex items-center gap-2">
              <Trash2 className="text-red-600" />
              Deleted Successfully!
            </div>,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: false,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              transition: Bounce,
              icon: false,
            }
          );
        } catch (error) {
          console.error("Error deleting year:", error);
        }
      }
    });
  };

  //-----LOGS ACTION-----
  const logAction = async (action, details) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInUser = user ? user.username : "Unknown User";

    try {
      await axios.post("http://localhost:5000/api/logs/create", {
        action,
        details,
        user: loggedInUser,
      });
    } catch (error) {
      console.error("failed to Logs Action", error);
    }
  };

  // Helper function to format date to datetime-local input format
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ""; // Invalid date
      
      // Adjust for timezone to ensure local time is preserved
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      // Format as YYYY-MM-DDThh:mm (datetime-local format)
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  return (
    <div className="select-none ">
      <ToastContainer />
      <div className="bg-slate-50 p-6 rounded-xl shadow-md text-center">
        <h1 className="text-2xl font-semibold font-montserrat mb-10">
          Manage Request
        </h1>
        <div className="overflow-x-auto">
          <div className="flex justify-start gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-60 border p-2 rounded mb-4"
            >
              <option value="">---Status---</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <table className="min-w-full table-auto rounded-xl overflow-hidden text-center text-sm">
            <thead>
              <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                <th className="border py-2 px-4">Control No</th>
                <th className="border py-2 px-4">Issue</th>
                <th className="border py-2 px-4">Workgroup</th>
                <th className="border py-2 px-4">Requested By</th>
                <th className="border py-2 px-4">Repair Done</th>
                <th className="border py-2 px-4">Service By</th>
                <th className="border py-2 px-4">Date Requested</th>
                <th className="border py-2 px-4">Date Accomplished</th>
                <th className="border py-2 px-4">Status</th>
                <th className="border py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="font-montserrat">
              {monitoring
                .filter((item) =>
                  statusFilter ? item.status === statusFilter : true
                )
                .map((item) => (
                  <tr
                    key={item.id}
                    className="even:bg-slate-100 hover:bg-gray-200 transition"
                  >
                    <td className="px-2 py-1">{item.controlno}</td>
                    <td className="px-2 py-1">{item.issue}</td>
                    <td className="px-2 py-1">{item.workgroup}</td>
                    <td className="px-2 py-1">{item.requestedby}</td>
                    <td className="px-2 py-1">{item.repairDone}</td>
                    <td className="px-2 py-1">{item.serviceby}</td>
                    <td className="px-2 py-1 whitespace-nowrap">
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
                    <td className="px-2 py-1 whitespace-nowrap">
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
                    <td className="px-2 py-1">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium
                ${
                  item.status === "Pending"
                    ? "bg-red-100 text-red-600"
                    : item.status === "In Progress"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
                }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => {
                          setSelectedRequest(item.id);
                          setEditControlNo(item.controlno);
                          setEditStatus(item.status);
                          setEditRepairDone(item.repairDone || "");
                          setEditServiceBy(item.serviceby || "");
                          setEditCreatedAt(formatDateForInput(item.createdAt));
                          setEditUpdatedAt(formatDateForInput(item.updatedAt));
                          setIsEditRequestModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      {isEditRequestModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
              Edit Request
            </h2>
            <form onSubmit={handleEditRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                  Control No
                </label>
                <input
                  type="text"
                  value={editControlNo}
                  onChange={(e) => setEditControlNo(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                  Repair Done
                </label>
                <input
                  type="text"
                  value={editRepairDone}
                  onChange={(e) => setEditRepairDone(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                  Serviced By
                </label>
                <select
                  value={editServiceBy}
                  onChange={(e) => setEditServiceBy(e.target.value)}
                  className="w-full border p-2 rounded mb-4"
                >
                  <option value="">--Please choose an option--</option>
                  {personnel.map((person) => (
                    <option key={person.id} value={person.personnels}>
                      {person.personnels}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <input
                  type="datetime-local"
                  value={editCreatedAt}
                  onChange={(e) => setEditCreatedAt(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Updated At
                </label>
                <input
                  type="datetime-local"
                  value={editUpdatedAt}
                  onChange={(e) => setEditUpdatedAt(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditRequestModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestPanel;
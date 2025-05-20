import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { toast, Bounce } from "react-toastify";
import {
  Trash2,
  Pencil,
  Check,
  BadgeAlert,
  Plus,
  ArrowDownUp,
} from "lucide-react";
import axios from "axios";

const IncidentManagement = () => {
  const [concerns, setConcerns] = useState([]);
  const [isAddConcernModalOpen, setIsAddConcernModalOpen] = useState(false);
  const [isEditConcernModalOpen, setIsEditConcernModalOpen] = useState(false);
  const [newConcern, setNewConcern] = useState("");
  const [selectedConcern, setSelectedConcern] = useState(null);
  const [sortConcern, setSortConcern] = useState(null);

  const [concernPage, setConcernPage] = useState(1);

  const rowsPerPage = 10;

  const sortConcerns = () => {
    let newConcerns = sortConcern === "asc" ? "desc" : "asc";
    const sorted = [...concerns].sort((a, b) => {
      if (newConcerns === "asc") {
        return a.concerns.localeCompare(b.concerns);
      } else {
        return b.concerns.localeCompare(a.concerns);
      }
    });
    setConcerns(sorted);
    setSortConcern(newConcerns);
  };

  useEffect(() => {
    fetchConcerns();
  }, []);

  //------------FETCH CONCERN------------
  const fetchConcerns = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/concern/get");
      setConcerns(res.data);
    } catch (error) {
      console.error("Error Fetching Concern:", error);
    }
  };

  //------------CREATE CONCERN------------
  const handleAddConcern = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/concern/create", {
        concerns: newConcern,
      });

      //LOGS ACTION
      await logAction("CREATE", `Created New Issue`);

      fetchConcerns();
      setNewConcern("");
      setIsAddConcernModalOpen(false);
      toast.info(
        <div className="flex text-center gap-2">
          <Check className="text-blue-600" />
          Created Successfully!
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          transition: Bounce,
          icon: false,
        }
      );
    } catch (error) {
      console.error("Error Adding New Concern:", error);
    }
  };

  const handleDeleteConcern = async (id) => {
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
          await axios.delete(`http://localhost:5000/api/concern/delete/${id}`);

          //LOGS ACTION
          await logAction("DELETE", `Deleted the Issue`);

          fetchConcerns();
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
          console.error("Error Deleting Concern:", error);
        }
      }
    });
  };

  //------------UPDATE CONCERN------------
  const handleEditConcern = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/concern/update/${selectedConcern}`,
        {
          concerns: newConcern,
        }
      );
      //LOGS ACTION
      await logAction("UPDATE", `Updated the Issue`);

      fetchConcerns();
      setIsEditConcernModalOpen(false);
      setNewConcern("");
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
      console.error("Error Updating Concern:", error);
    }
  };

  const handleNextConcernPage = () => {
    if (concernPage * rowsPerPage < concerns.length) {
      setConcernPage(concernPage + 1);
    }
  };

  const handlePrevConcernPage = () => {
    if (concernPage > 1) {
      setConcernPage(concernPage - 1);
    }
  };

  const paginatedConcerns = concerns.slice(
    (concernPage - 1) * rowsPerPage,
    concernPage * rowsPerPage
  );

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

  return (
    <div className="select-none">
      {/* Manage Issue Section */}
      <div className="bg-slate-50 p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold mb-4 font-montserrat flex items-center gap-2">
          <BadgeAlert />
          Issues
        </h1>
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsAddConcernModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 font-montserrat"
          >
            <Plus className="w-4 h-4" />
            Add Issue
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                <th
                  className="py-2 px-4 flex items-center gap-2 cursor-pointer"
                  onClick={sortConcerns}
                >
                  Technical Concern{" "}
                  <div>
                    <ArrowDownUp
                      className=" hover:text-blue-700 animate-pulse transition duration-300"
                      size={16}
                    />
                  </div>
                </th>
                <th className="py-2 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="font-montserrat">
              {paginatedConcerns.map((concern, index) => (
                <tr
                  key={concern.id}
                  className="even:bg-slate-100 hover:bg-gray-100 transition"
                >
                  <td className="py-1 px-2">{concern.concerns}</td>
                  <td className="py-1 px-2 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedConcern(concern.id);
                        setNewConcern(concern.concerns);
                        setIsEditConcernModalOpen(true);
                      }}
                      className="p-2 text-blue-500 hover:text-blue-700 transition duration-300 rounded cursor-pointer"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteConcern(concern.id)}
                      className="p-2 text-red-500 hover:text-red-700 transition duration-300 rounded cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevConcernPage}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              disabled={concernPage === 1}
            >
              Prev
            </button>
            <button
              onClick={handleNextConcernPage}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              disabled={concernPage * rowsPerPage >= concerns.length}
            >
              Next
            </button>
          </div>
        </div>

        {isAddConcernModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
                Add New Issue
              </h2>
              <form onSubmit={handleAddConcern} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                    Issue
                  </label>
                  <input
                    type="text"
                    placeholder="Enter concern..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddConcernModalOpen(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditConcernModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
                Edit Issue {newConcern}
              </h2>
              <form onSubmit={handleEditConcern} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                    Issue
                  </label>
                  <input
                    type="text"
                    placeholder="Enter concern..."
                    value={newConcern}
                    onChange={(e) => setNewConcern(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditConcernModalOpen(false)}
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
    </div>
  );
};

export default IncidentManagement;

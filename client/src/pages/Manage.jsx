import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import {
  ArrowDownUp,
  Trash2,
  Pencil,
  Check,
  CalendarDays,
  Plus,
} from "lucide-react";
import axios from "axios";
import IncidentManagement from "./IncidentManagement";
import WorkgroupManagement from "./WorkgroupManagement";
import Personnel from "./Itpersonnel.jsx";

const Manage = () => {
  const [years, setYears] = useState([]);
  const [newYear, setNewYear] = useState("");
  const [isAddYearModalOpen, setIsAddYearModalOpen] = useState(false);
  const [isEditYearModalOpen, setIsEditYearModalOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState(null);

  const [issueCounts, setIssueCounts] = useState({});

  const [selectedYearForMonitoring, setSelectedYearForMonitoring] =
    useState(null);
  const [selectedMonthForMonitoring, setSelectedMonthForMonitoring] =
    useState(null);
  const [monitoringData, setMonitoringData] = useState([]);
  const [monthsForSelectedYear, setMonthsForSelectedYear] = useState([]);

  const [yearPage, setYearPage] = useState(1);
  const [sortYear, setSortYear] = useState(null);

  const rowsPerPage = 10;

  const sortYears = () => {
    let newYears = sortYear === "asc" ? "desc" : "asc";
    const sorted = [...years].sort((a, b) => {
      if (newYears === "asc") {
        return newYears === "asc" ? a.year - b.year : b.year - a.year;
      } else {
        return newYears === "desc" ? b.year - a.year : a.year - b.year;
      }
    });
    setYears(sorted);
    setSortYear(newYears);
  };

  const fetchMonthsForYear = async (yearId) => {
    try {
      const res = await axios.get(
        `http://192.168.1.3:5000/api/month/getByYear/${yearId}`
      );
      setMonthsForSelectedYear(res.data);
    } catch (error) {
      console.error("Error fetching months:", error);
    }
  };

  const handleSelectYear = async (yearId, yearValue) => {
    setSelectedYearForMonitoring(yearValue);
    setSelectedMonthForMonitoring(null);
    setMonitoringData([]);

    // Fetch months for the selected year
    await fetchMonthsForYear(yearId);
  };

  //GET TABLE FROM SELECTED MONTH
  const handleSelectMonth = async (monthId, monthName) => {
    setSelectedMonthForMonitoring(monthName);

    try {
      const res = await axios.get(
        `http://192.168.1.3:5000/api/year/get-request/${monthId}`
      );

      const data = res.data;
      setMonitoringData(data);

      // Count occurrences of issues
      const newIssueCounts = {};

      data.forEach((item) => {
        const issue = item.issue;
        if (newIssueCounts[issue]) {
          newIssueCounts[issue] += 1;
        } else {
          newIssueCounts[issue] = 1;
        }
      });

      setIssueCounts(newIssueCounts);
    } catch (error) {
      console.error("Error fetching monitoring data:", error);
    }
  };

  useEffect(() => {
    fetchYears();
  }, []);

  //------------FETCH YEARS------------
  const fetchYears = async () => {
    try {
      const res = await axios.get("http://192.168.1.3:5000/api/year/get-year");
      setYears(res.data);
    } catch (error) {
      console.error("Error Fetching Year:", error);
    }
  };

  //------------CREATE YEAR------------
  const handleAddYear = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.1.3:5000/api/year/create-year", {
        year: newYear,
      });

      //LOGS ACTION
      await logAction("CREATE", `Created a Year`);

      setNewYear("");
      setIsAddYearModalOpen(false);
      fetchYears();
      toast.info(
        <div className="flex text-center gap-2">
          <Check className="text-blue-600" />
          Year Added Successfully!
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
    } catch {
      Swal.fire({
        title: "Year already exists!",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  //------------UPDATE YEAR------------
  const handleEditYear = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://192.168.1.3:5000/api/year/update-year/${selectedYear}`,
        {
          year: newYear,
        }
      );

      //LOGS ACTION
      await logAction("UPDATE", `Updated a Year`);

      fetchYears();
      setIsEditYearModalOpen(false);
      setNewYear("");
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
      console.error("Error Updating Year:", error);
    }
  };

  //------------DELETE YEAR------------
  const handleDeleteYear = async (id) => {
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
            `http://192.168.1.3:5000/api/year/delete-year/${id}`
          );

          //LOGS ACTION
          await logAction("DELETE", `Deleted a Year`);

          fetchYears();
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

  const handleNextYearPage = () => {
    if (yearPage * rowsPerPage < years.length) {
      setYearPage(yearPage + 1);
    }
  };

  const handlePrevYearPage = () => {
    if (yearPage > 1) {
      setYearPage(yearPage - 1);
    }
  };

  const paginatedYears = years.slice(
    (yearPage - 1) * rowsPerPage,
    yearPage * rowsPerPage
  );

  //-----LOGS ACTION-----
  const logAction = async (action, details) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const loggedInUser = user ? user.username : "Unknown User";

    try {
      await axios.post("http://192.168.1.3:5000/api/logs/create", {
        action,
        details,
        user: loggedInUser,
      });
    } catch (error) {
      console.error("failed to Logs Action", error);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-14 p-0 mb-10 select-none">
        {/* Manage Year Section */}
        <div className="bg-slate-50 p-6 rounded-xl shadow-md h-full">
          <h1 className="text-2xl font-semibold mb-4 font-montserrat flex items-center gap-2">
            <CalendarDays /> Years
          </h1>
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => setIsAddYearModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 font-montserrat"
            >
              <Plus className="w-4 h-4" />
              Add Year
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm">
              <thead>
                <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                  <th
                    className="py-2 px-4 flex items-center gap-2 cursor-pointer"
                    onClick={sortYears}
                  >
                    Year{" "}
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
                {paginatedYears.map((year, index) => (
                  <tr
                    key={year.id}
                    className="even:bg-slate-100 hover:bg-gray-300 transition"
                  >
                    <td className="py-1 px-2">{year.year}</td>
                    <td className="py-1 px-2 gap-2 justify-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => {
                            setSelectedYear(year.id);
                            setNewYear(year.year);
                            setIsEditYearModalOpen(true);
                          }}
                          className="p-2 text-blue-500 hover:text-blue-700 transition duration-300 rounded cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteYear(year.id)}
                          className="p-2 text-red-500 hover:text-red-700 transition duration-300 rounded cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePrevYearPage}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
                disabled={yearPage === 1}
              >
                Prev
              </button>
              <button
                onClick={handleNextYearPage}
                className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
                disabled={yearPage * rowsPerPage >= years.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
        {isAddYearModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
                Add New Year
              </h2>
              <form onSubmit={handleAddYear} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                    Year
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Year"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddYearModalOpen(false)}
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

        {isEditYearModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
                Edit Year {newYear}
              </h2>
              <form onSubmit={handleEditYear} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                    Year
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Year"
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditYearModalOpen(false)}
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
        {/* Manage Issue Section */}
        <IncidentManagement />

        {/* Manage Workgroup Section */}
        <WorkgroupManagement />

        {/* Manage ItPersonnel Section */}
        <Personnel />
      </div>
    </>
  );
};

export default Manage;

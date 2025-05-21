import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { toast, Bounce } from "react-toastify";
import {
  Plus,
  Pencil,
  Trash2,
  Check,
  UserCog,
  ArrowDownUp,
} from "lucide-react";

const Itpersonnel = () => {
  const [personnel, setPersonnel] = useState([]);
  const [isAddPersonnelModalOpen, setIsAddPersonnelModalOpen] = useState(false);
  const [isEditPersonnelModalOpen, setIsEditPersonnelModalOpen] =
    useState(false);
  const [newPersonnel, setNewPersonnel] = useState("");
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);

  //Pages
  const [personnelPage, setPersonnelPage] = useState(1);
  const [sortPersonnel, setSortPersonnel] = useState(null);

  const rowsPerPage = 10;

  const sortPersonnels = () => {
    let newPersonnels = sortPersonnel === "asc" ? "desc" : "asc";
    const sorted = [...personnel].sort((a, b) => {
      if (newPersonnels === "asc") {
        return a.personnels.localeCompare(b.personnels);
      } else {
        return b.personnels.localeCompare(a.personnels);
      }
    });
    setPersonnel(sorted);
    setSortPersonnel(newPersonnels);
  };

  useEffect(() => {
    fetchPersonnel();
  }, []);

  //------------FETCH IT PERSONNEL------------
  const fetchPersonnel = async () => {
    try {
      const res = await axios.get("http://192.168.1.3:5000/api/personnel/get");
      setPersonnel(res.data);
    } catch (error) {
      console.error("Error Fetching Personnels", error);
    }
  };

  //------------CREATE IT PERSONNEL------------
  const handleAddPersonnel = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://192.168.1.3:5000/api/personnel/create", {
        personnels: newPersonnel,
      });

      //LOGS ACTION
      await logAction("CREATE", `Created IT Personnel`);

      fetchPersonnel();
      setNewPersonnel("");
      setIsAddPersonnelModalOpen(false);
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
      console.error("Error Creating New Personnel", error);
    }
  };

  //------------UPDATE IT PERSONNEL------------
  const handleEditPersonnel = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://192.168.1.3:5000/api/personnel/update/${selectedPersonnel}`,
        {
          personnels: newPersonnel,
        }
      );

      //LOGS ACTION
      await logAction("UPDATE", `Updated IT Personnel`);

      fetchPersonnel();
      setNewPersonnel("");
      setIsEditPersonnelModalOpen(false);
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
      console.error("Error Updating Personnel", error);
    }
  };

  //------------DELETE CONCERN------------
  const handleDeletePersonnel = async (id) => {
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
            `http://192.168.1.3:5000/api/personnel/delete/${id}`
          );

          //LOGS ACTION
          await logAction("DELETE", `Deleted IT Personnel`);

          fetchPersonnel();
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
          console.error("Error Deleting Personnel", error);
        }
      }
    });
  };

  const handleNextPersonnelPage = () => {
    if (personnelPage * rowsPerPage < personnel.length) {
      setPersonnelPage(personnelPage + 1);
    }
  };

  const handlePrevPersonnelPage = () => {
    if (personnelPage > 1) {
      setPersonnelPage(personnelPage - 1);
    }
  };

  const paginatedPersonnel = personnel.slice(
    (personnelPage - 1) * rowsPerPage,
    personnelPage * rowsPerPage
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
    <div className="select-none">
      <div className="bg-slate-50 p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-semibold font-montserrat mb-4 flex items-center gap-2">
          <UserCog />
          IT Personnel
        </h1>

        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setIsAddPersonnelModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 font-montserrat"
            title="Add Personnel"
          >
            <Plus size={20} /> Add IT Personnel
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm">
            <thead>
              <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
                <th
                  className="py-2 px-4 flex items-center gap-2 cursor-pointer"
                  onClick={sortPersonnels}
                >
                  IT Personnels{" "}
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
              {paginatedPersonnel.map((personnel, index) => (
                <tr
                  key={personnel.id}
                  className="even:bg-slate-100 hover:bg-gray-300 transition"
                >
                  <td className="py-1 px-2">{personnel.personnels}</td>
                  <td className="py-1 px-2 flex gap-2 justify-center">
                    <button
                      onClick={() => {
                        setSelectedPersonnel(personnel.id);
                        setNewPersonnel(personnel.personnels);
                        setIsEditPersonnelModalOpen(true);
                      }}
                      className="p-2 text-blue-600 hover:text-blue-700 transition duration-300"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePersonnel(personnel.id)}
                      className="p-2 text-red-600 hover:text-red-700 transition duration-300"
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
              onClick={handlePrevPersonnelPage}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              disabled={personnelPage === 1}
            >
              Prev
            </button>
            <button
              onClick={handleNextPersonnelPage}
              className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
              disabled={personnelPage * rowsPerPage >= personnel.length}
            >
              Next
            </button>
          </div>
        </div>

        {isAddPersonnelModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
                Add New IT Personnel
              </h2>
              <form onSubmit={handleAddPersonnel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={newPersonnel}
                    onChange={(e) => setNewPersonnel(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddPersonnelModalOpen(false)}
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

        {isEditPersonnelModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
            <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
                Update IT Personnel: {newPersonnel}
              </h2>
              <form onSubmit={handleEditPersonnel} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name..."
                    value={newPersonnel}
                    onChange={(e) => setNewPersonnel(e.target.value)}
                    className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditPersonnelModalOpen(false)}
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

export default Itpersonnel;

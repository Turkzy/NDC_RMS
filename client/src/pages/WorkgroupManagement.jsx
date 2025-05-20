import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";
import { toast, Bounce } from "react-toastify";
import {
  ArrowDownUp,
  Trash2,
  Pencil,
  Check,
  Plus,
  UsersRound,
} from "lucide-react";
import axios from "axios";

const WorkgroupManagement = () => {
  const [groups, setGroups] = useState([]);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isEditGroupModalOpen, setIsEditGroupModalOpen] = useState(false);
  const [newGroup, setNewGroup] = useState("");
  const [selectedGroups, setSelectedGroups] = useState(null);
  const [sortGroup, setSortGroup] = useState(null);

  const [groupPage, setGroupPage] = useState(1);
  const rowsPerPage = 10;

  const sortGroups = () => {
    let newGroups = sortGroup === "asc" ? "desc" : "asc";
    const sorted = [...groups].sort((a, b) => {
      if (newGroups === "asc") {
        return a.workgroups.localeCompare(b.workgroups);
      } else {
        return b.workgroups.localeCompare(a.workgroups);
      }
    });
    setGroups(sorted);
    setSortGroup(newGroups);
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  //------------FETCH WORKGROUPS------------
  const fetchGroups = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/group/get");
      setGroups(res.data);
    } catch (error) {
      console.error("Error Fetching WorkGroup", error);
    }
  };

  //------------CREATE WORKGROUPS------------
  const handleAddGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/group/create", {
        workgroups: newGroup,
      });

      //LOGS ACTION
      await logAction("CREATE", `Create New Workgroup`);

      fetchGroups();
      setNewGroup("");
      setIsAddGroupModalOpen(false);
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
      console.error("Error Creating New Group", error);
    }
  };

  //------------DELETE WORKGROUPS------------
  const handleDeleteGroup = async (id) => {
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
          await axios.delete(`http://localhost:5000/api/group/delete/${id}`);

          //LOGS ACTION
          await logAction("DELETE", `Deleted the Workgroup`);

          fetchGroups();
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
          console.error("Error Deleting Workgroup", error);
        }
      }
    });
  };

  //------------UPDATE WORKGROUPS------------
  const handleEditGroup = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/group/update/${selectedGroups}`,
        {
          workgroups: newGroup,
        }
      );

      //LOGS ACTION
      await logAction("UPDATE", `Updated the Workgroup`);

      fetchGroups();
      setIsEditGroupModalOpen(false);
      setNewGroup("");
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
      console.error("Error Updating Group", error);
    }
  };

  const handleNextGroupPage = () => {
    if (groupPage * rowsPerPage < groups.length) {
      setGroupPage(groupPage + 1);
    }
  };

  const handlePrevGroupPage = () => {
    if (groupPage > 1) {
      setGroupPage(groupPage - 1);
    }
  };

  const paginatedGroups = groups.slice(
    (groupPage - 1) * rowsPerPage,
    groupPage * rowsPerPage
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
    <div className="bg-slate-50 p-6 rounded-xl shadow-md select-none">
      <h1 className="text-2xl font-semibold font-montserrat mb-4 flex items-center gap-2">
        <UsersRound />
        Workgroups
      </h1>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setIsAddGroupModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 font-montserrat"
          title="Add Workgroup"
        >
          <Plus size={20} /> Add Workgroup
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm">
          <thead>
            <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
              <th
                className="py-2 px-4 flex items-center gap-2 cursor-pointer"
                onClick={sortGroups}
              >
                Workgroups{" "}
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
            {paginatedGroups.map((group, index) => (
              <tr
                key={group.id}
                className="even:bg-slate-100 hover:bg-gray-300 transition"
              >
                <td className="py-1 px-2">{group.workgroups}</td>
                <td className="py-1 px-2 flex gap-2 justify-center">
                  <button
                    onClick={() => {
                      setSelectedGroups(group.id);
                      setNewGroup(group.workgroups);
                      setIsEditGroupModalOpen(true);
                    }}
                    className="p-2 text-blue-500 hover:text-blue-700 transition duration-300"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteGroup(group.id)}
                    className="p-2 text-red-500 hover:text-red-700 transition duration-300"
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
            onClick={handlePrevGroupPage}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            disabled={groupPage === 1}
          >
            Prev
          </button>
          <button
            onClick={handleNextGroupPage}
            className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"
            disabled={groupPage * rowsPerPage >= groups.length}
          >
            Next
          </button>
        </div>
      </div>

      {isAddGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
              Add New Group
            </h2>
            <form onSubmit={handleAddGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                  Workgroup
                </label>
                <input
                  type="text"
                  placeholder="Enter new workgroup..."
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddGroupModalOpen(false)}
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

      {isEditGroupModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 transform transition-all duration-300 scale-100">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
              Edit Workgroup {newGroup}
            </h2>
            <form onSubmit={handleEditGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 font-montserrat">
                  Workgroup
                </label>
                <input
                  type="text"
                  placeholder="Enter new workgroup..."
                  value={newGroup}
                  onChange={(e) => setNewGroup(e.target.value)}
                  className="block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditGroupModalOpen(false)}
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

export default WorkgroupManagement;

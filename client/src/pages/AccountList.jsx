import React, { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Check, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast, Bounce, ToastContainer } from "react-toastify";
import Swal from "sweetalert2";
import "react-toastify/dist/ReactToastify.css";

const AccountList = () => {
  const [users, setUsers] = useState([]);

  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);
  const [isEditAccountModalOpen, setIsEditAccountModalOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://192.168.1.3:5000/api/auth/all-users");
      setUsers(res.data.users || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  // Email validation function
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!email || !password) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          Email and password are required
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
          icon: false,
        }
      );
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          Please enter a valid email address
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
          icon: false,
        }
      );
      return;
    }

    try {
      await axios.post("http://192.168.1.3:5000/api/auth/add-user", {
        email,
        password,
        username,
      });

      //LOGS ACTION
      await logAction("CREATE", `Created New Account`);

      fetchUsers();
      setEmail("");
      setPassword("");
      setUsername("");
      setIsAddAccountModalOpen(false);

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
      console.error("Error Creating User", error);
    }
  };

  const openEditModal = (user) => {
    setEditingUserId(user.id);
    setEmail(user.email);
    setPassword("");
    setUsername(user.username);
    setIsEditAccountModalOpen(true);
  };

  const handleEditAccount = async (e) => {
    e.preventDefault();

    // Validate email is present
    if (!email) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          Email is required
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
          icon: false,
        }
      );
      return;
    }

    // Validate email format
    if (!isValidEmail(email)) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          Please enter a valid email address
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
          icon: false,
        }
      );
      return;
    }

    // Validate password is present for update
    if (!password) {
      toast.error(
        <div className="flex items-center gap-2">
          <AlertCircle className="text-red-600" />
          Password is required to update user
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          transition: Bounce,
          icon: false,
        }
      );
      return;
    }

    try {
      await axios.put(
        `http://192.168.1.3:5000/api/auth/update-user/${editingUserId}`,
        {
          email,
          password,
          username,
        }
      );

      //LOGS ACTION
      await logAction("UPDATE", `Updated User Account`);

      fetchUsers();
      setEditingUserId(null);
      setEmail("");
      setPassword("");
      setUsername("");
      setIsEditAccountModalOpen(false);

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
      console.error("Error Updating User", error);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `http://192.168.1.3:5000/api/auth/delete-user/${id}`
          );

          //LOGS ACTION
          await logAction("DELETE", `Deleted User Account`);

          fetchUsers();
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
          console.error("Error deleting user:", error);
        }
      }
    });
  };

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
    <div className="bg-slate-50 p-6 rounded-xl shadow-md select-none">
      <ToastContainer />
      <div className="bg-gradient-to-r from-green-500 to-indigo-600 py-4 px-6 rounded mb-10">
        <h1 className="text-xl font-semibold text-white font-montserrat">
          Users Account
        </h1>
      </div>

      <div className="mb-4 flex justify-end">
        <button
          onClick={() => {
            setEmail("");
            setPassword("");
            setUsername("");
            setIsAddAccountModalOpen(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 transition duration-200 font-montserrat"
        >
          <Plus size={20} /> Add User
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full table-auto rounded-xl overflow-hidden text-sm">
          <thead>
            <tr className="bg-slate-300 font-montserrat text-sm text-gray-800">
              <th className="py-2 px-4">Username</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Password</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody className="font-montserrat text-center">
            {users.length > 0 ? (
              users.map((item) => (
                <tr
                  key={item.id}
                  className="even:bg-slate-100 hover:bg-gray-300 transition"
                >
                  <td className="py-1 px-2">{item.username}</td>
                  <td className="py-1 px-2">{item.email}</td>
                  <td className="py-1 px-2">
                    {item.password ? "********" : "No Password"}
                  </td>
                  <td className="py-1 px-2 flex gap-2 justify-center">
                    <button
                      className="p-2 text-blue-600 hover:text-blue-700 transition"
                      onClick={() => {
                        setPassword("");
                        openEditModal(item);
                      }}
                      title="Edit User"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:text-red-700 transition"
                      onClick={() => handleDelete(item.id)}
                      title="Delete User"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="py-4 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isAddAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
              Add New User
            </h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="username"
                  className="w-full border rounded px-3 py-2"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username..."
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAccountModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditAccountModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 font-montserrat">
              Edit User
            </h2>
            <form onSubmit={handleEditAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  className="w-full border rounded px-3 py-2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email..."
                  required
                />
                <label className="block text-sm font-medium text-gray-700 mt-4 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  className="w-full border rounded px-3 py-2"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter New password..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditAccountModalOpen(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
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

export default AccountList;

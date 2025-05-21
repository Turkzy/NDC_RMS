import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pencil, Save } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
import { toast, Bounce, ToastContainer } from "react-toastify";

const AccountPanel = () => {
  const [isEditing, setIsEditing] = useState(false);

  // User data
  const [username, setUsername] = useState("");
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get the current logged-in user's information
    fetchCurrentUserData();
  }, []);

  // Fetch the currently logged-in user's data
  const fetchCurrentUserData = () => {
    try {
      // Get user data from localStorage
      const userData = localStorage.getItem("user");

      if (userData) {
        const user = JSON.parse(userData);
        setEmail(user.email || "");

        // Get the token from localStorage
        const token = localStorage.getItem("token");

        if (token) {
          // Fetch complete user profile using the token
          fetchUserProfile(token);
        }
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      toast.error("Could not load user profile", {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
      });
    }
  };

  // Fetch complete user profile
  const fetchUserProfile = async (token) => {
    try {
      // Get user email from localStorage
      const userData = JSON.parse(localStorage.getItem("user"));

      if (userData && userData.email) {
        // Find the user by email to get complete profile
        const res = await axios.get(
          "http://192.168.1.3:5000/api/auth/all-users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const userList = res.data.users || [];
        const currentUser = userList.find(
          (user) => user.email === userData.email
        );

        if (currentUser) {
          setUserId(currentUser.id);
          setUsername(currentUser.username || "");
          setFirstName(currentUser.firstname || "");
          setLastName(currentUser.lastname || "");
          setMobile(currentUser.mobile || "");
          setEmail(currentUser.email || "");
          // Don't set password here for security reasons
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Handle form submission to update user profile
  const handleEditAccount = async (e) => {
    e.preventDefault();

    // Validate password
    if (!password || password.trim() === "") {
      toast.error("Password is required to update your profile.", {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://192.168.1.3:5000/api/auth/update-user/${userId}`,
        {
          username,
          firstname,
          lastname,
          mobile,
          email,
          password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update localStorage with new data
      const updatedUser = { email, username };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Refresh user data
      fetchUserProfile(token);

      //LOGS ACTION
      await logAction("UPDATE", `${username} Successfully Updated its Profile` );

      setIsEditing(false);
      setPassword(""); // Clear password field after update

      toast.success(
        <div className="flex items-center gap-2">
          <Pencil className="text-green-600" />
          Profile Updated Successfully!
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
      console.error("Error updating account:", error);
      toast.error(error.response?.data?.message || "Failed to update profile", {
        position: "top-right",
        autoClose: 5000,
        transition: Bounce,
      });
    }
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
    <div className="bg-slate-50 p-6 rounded-xl shadow-md">
      <ToastContainer />
      <div className="bg-gradient-to-r from-green-500 to-indigo-600 py-4 px-6 rounded">
        <h1
          className="text-xl font-semibold text-white font-montserrat"
          style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
        >
          Account Settings
        </h1>
      </div>

      <div className="p-6">
        <form>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username || ""}
              onChange={(e) => setUsername(e.target.value)}
              name="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
              disabled={!isEditing}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First name
              </label>
              <input
                type="text"
                value={firstname || ""}
                onChange={(e) => setFirstName(e.target.value)}
                name="firstname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
                disabled={!isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                value={lastname || ""}
                onChange={(e) => setLastName(e.target.value)}
                type="text"
                name="lastname"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mobile Number
            </label>
            <input
              value={mobile || ""}
              onChange={(e) => setMobile(e.target.value)}
              type="text"
              name="mobile"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
              disabled={!isEditing}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              value={email || ""}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              name="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-50"
              disabled={!isEditing}
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="flex items-center mb-4">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder={
                  isEditing ? "Enter password to confirm changes" : "••••••••"
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                disabled={!isEditing}
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(true);
                  setPassword("");
                }}
                className={`flex items-center gap-2 mr-5 px-5 py-2.5 ${
                  isEditing ? "bg-gray-400" : "bg-blue-600"
                } text-white text-sm font-medium rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 transition duration-200 font-montserrat`}
                title="Edit"
                disabled={isEditing}
              >
                <Pencil size={16} /> Edit Profile
              </button>
              {isEditing && (
                <button
                  onClick={handleEditAccount}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition duration-200"
                  type="button"
                >
                  <Save size={16} /> Save Changes
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountPanel;

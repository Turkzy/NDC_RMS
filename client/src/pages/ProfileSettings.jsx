import React, { useEffect, useState } from "react";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Check, Upload, X, User } from "lucide-react";
import api, { endpoints, FILE_BASE_URL } from "../config/api";

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        setForm({
          username: parsed.username || "",
          email: parsed.email || "",
          password: "",
        });
        // Set profile image preview if imageUrl exists
        if (parsed.imageUrl) {
          setProfileImagePreview(`${FILE_BASE_URL}/userimages/${parsed.imageUrl}`);
        }
      } catch (err) {
        console.error("Invalid user in localStorage:", err);
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        toast.error("Please select a valid image file (JPG, JPEG, or PNG)");
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5_000_000) {
        toast.error("File size must be less than 5MB");
        return;
      }
      setProfileImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    // Reset to original image if exists, otherwise clear preview
    if (user?.imageUrl) {
      setProfileImagePreview(`${FILE_BASE_URL}/userimages/${user.imageUrl}`);
    } else {
      setProfileImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      // Check if we have a file to upload
      const hasFile = profileImage !== null;
      
      let res;
      if (hasFile) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append("username", form.username.trim());
        formData.append("email", form.email.trim());
        
        if (form.password.trim()) {
          formData.append("password", form.password.trim());
        }

        // Preserve existing role if present
        if (user.roleId) {
          formData.append("roleId", user.roleId);
        }

        // Append image file
        formData.append("image", profileImage);

        res = await api.put(endpoints.user.update(user.id), formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        // Use JSON for regular update
        const payload = {
          username: form.username.trim(),
          email: form.email.trim(),
        };

        if (form.password.trim()) {
          payload.password = form.password.trim();
        }

        // Preserve existing role if present
        if (user.roleId) {
          payload.roleId = user.roleId;
        }

        res = await api.put(endpoints.user.update(user.id), payload);
      }

      if (res.data && res.data.error === false) {
        const updatedUser = res.data.user || { 
          ...user, 
          username: form.username.trim(), 
          email: form.email.trim(),
          imageUrl: res.data.user?.imageUrl || user.imageUrl
        };

        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setForm((prev) => ({ ...prev, password: "" }));
        setProfileImage(null);
        
        // Update preview with new image URL if available
        if (updatedUser.imageUrl) {
          setProfileImagePreview(`${FILE_BASE_URL}/userimages/${updatedUser.imageUrl}`);
        }

        // Dispatch custom event to notify other components (like Header) of user update
        window.dispatchEvent(new CustomEvent("userUpdated", { detail: updatedUser }));

        toast.success(
          <div className="flex items-center gap-2">
            <Check className="text-green-600" />
            Profile updated successfully!
          </div>,
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            transition: Bounce,
            icon: false,
          }
        );
      } else {
        toast.error(res.data?.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <p className="text-gray-600 font-montserrat">
          Unable to load profile information. Please try logging in again.
        </p>
      </div>
    );
  }

  return (
    <div className="select-none">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <div className="bg-white p-6 rounded-xl shadow-md ">
        <h1 className="text-2xl font-semibold font-montserrat text-gray-700 mb-6">
          Profile Settings
        </h1>
        <p className="text-sm text-gray-500 mb-6 font-montserrat">
          Update the username, email, and password for your current account.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Picture Upload */}
          <div>
            <label className="block text-sm font-medium font-montserrat text-gray-600 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              {/* Profile Picture Preview */}
              <div className="relative">
                {profileImagePreview ? (
                  <div className="relative">
                    <img
                      src={profileImagePreview}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                    {profileImage && (
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
                        title="Remove new image"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                    <User className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <label
                  htmlFor="profile-image"
                  className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-emerald-200 bg-emerald-50/70 rounded-lg text-sm text-emerald-600 cursor-pointer hover:border-emerald-400 transition font-montserrat"
                >
                  <Upload size={18} />
                  <span className="font-semibold">
                    {profileImage ? profileImage.name : "Upload Image"}
                  </span>
                </label>
                <input
                  type="file"
                  id="profile-image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/jpeg, image/png, image/jpg"
                  className="hidden"
                />
                <p className="text-xs text-gray-500 mt-1 font-montserrat">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium font-montserrat text-gray-600 mb-1">
              New Password{" "}
              <span className="text-xs text-gray-400">(leave blank if you do not want to change it)</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              minLength={6}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setForm({
                  username: user.username || "",
                  email: user.email || "",
                  password: "",
                });
                setProfileImage(null);
                if (user?.imageUrl) {
                  setProfileImagePreview(`${FILE_BASE_URL}/userimages/${user.imageUrl}`);
                } else {
                  setProfileImagePreview(null);
                }
              }}
              className="px-4 py-2 text-sm border rounded-lg text-gray-600 hover:bg-gray-100 font-montserrat transition"
              disabled={isSaving}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 font-montserrat transition disabled:opacity-60"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;



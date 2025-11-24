import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../config/api";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    roleId: "",
  });
  const [roles, setRoles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await api.get(endpoints.rbac.getRoles);
        if (response.data.error === false && response.data.roles) {
          setRoles(response.data.roles);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to load roles. Please refresh the page.");
      } finally {
        setLoadingRoles(false);
      }
    };
    fetchRoles();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      // Convert roleId to number for backend
      const submitData = {
        ...formData,
        roleId: Number(formData.roleId),
      };
      await api.post(endpoints.auth.register, submitData);
      setMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      const apiMessage =
        err.response?.data?.message ||
        "Unable to create account. Please try again.";
      setError(apiMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label
              className="block text-sm font-medium mb-1"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="roleId">
              Role
            </label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
              disabled={loadingRoles}
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>
        {message && (
          <p className="text-green-600 text-sm mt-4 text-center">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
        )}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="w-full mt-4 text-sm text-blue-600"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default CreateAccount;

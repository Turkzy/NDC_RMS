import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../config/api";

const CreateAccount = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear password errors when user starts typing
    if (name === 'password' && passwordErrors.length > 0) {
      setPasswordErrors([]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);
    setPasswordErrors([]);

    try {
      await api.post(endpoints.auth.register, formData);
      setMessage("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      // Check if it's a validation error with details
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        // Filter password-related errors
        const passwordValidationErrors = err.response.data.details
          .filter(detail => detail.field === 'password')
          .map(detail => detail.message);
        
        if (passwordValidationErrors.length > 0) {
          setPasswordErrors(passwordValidationErrors);
          setError("Password does not meet requirements:");
        } else {
          // Other validation errors
          const otherErrors = err.response.data.details
            .map(detail => `${detail.field}: ${detail.message}`)
            .join(', ');
          setError(otherErrors || err.response.data.message);
        }
      } else {
        // Generic error message
        const apiMessage =
          err.response?.data?.message ||
          "Unable to create account. Please try again.";
        setError(apiMessage);
      }
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
              className={`w-full border rounded px-3 py-2 ${
                passwordErrors.length > 0 ? "border-red-500" : ""
              }`}
              required
              minLength={8}
            />
            {/* Display password validation errors */}
            {passwordErrors.length > 0 && (
              <ul className="mt-2 text-sm text-red-600 list-disc list-inside">
                {passwordErrors.map((errorMsg, index) => (
                  <li key={index}>{errorMsg}</li>
                ))}
              </ul>
            )}
            {/* Password requirements hint */}
            {passwordErrors.length === 0 && formData.password && (
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </p>
            )}
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
        {error && passwordErrors.length === 0 && (
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

import React, { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import bglogin from "../assets/sample2.png";
import bg from "../assets/bg2.png"
import logo from "../assets/ndc_logo.png";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { endpoints } from "../config/api";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  // Check for existing authentication on mount
  useEffect(() => {
    // Check if user data exists in sessionStorage
    // The actual authentication will be verified by ProtectedRoute
    const user = sessionStorage.getItem("user");
    if (user) {
      // User data exists, let ProtectedRoute verify the cookie
      // For now, just stay on login page - user will be redirected if authenticated
    } else {
      // Clear any stale data
      sessionStorage.removeItem("user");
    }

    // Load remembered email
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    // Password validation
    if (!password) {
      setError("Please enter your password");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(endpoints.auth.login, { email, password });

      const { user } = response.data;

      if (!user || !user.id || !user.email) {
        setError("User data incomplete. Please contact the administrator.");
        setLoading(false);
        return;
      }

      // Store user data in sessionStorage (token is now in httpOnly cookie)
      sessionStorage.setItem("user", JSON.stringify(user));

      // Handle "Remember Me"
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setLoading(false);
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      if (err.code === "ECONNABORTED") {
        setError("Connection timeout. Please check your internet connection and try again.");
      } else if (err.response?.status === 401) {
        setError("Invalid email or password. Please try again.");
      } else if (err.response?.status === 404) {
        setError("Server not found. Please contact administrator.");
      } else if (err.response?.status >= 500) {
        setError("Server error. Please try again later.");
      } else if (!err.response) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-900 select-none">
      <div className="w-full md:w-4/5 flex items-center justify-center px-6 py-16 md:px-12 relative overflow-hidden bg-cover bg-right" 
      style={{ backgroundImage: `url(${bg})` }}>

        <div className="relative z-10 w-full max-w-md space-y-10">
          <div className="text-center space-y-4">
            <img src={logo} alt="logo" className="mx-auto h-28" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gray-500">
                National Development Company
              </p>
              <h1 className="text-3xl text-slate-700 font-medium mt-2">Welcome Back</h1>
              <p className="text-gray-500 text-sm">
                Sign in to access the Repair & Maintenance System.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleLogin}>
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm bg-white disabled:bg-gray-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-sm bg-white disabled:bg-gray-50 pr-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-emerald-500 border-gray-300 rounded focus:ring-emerald-500"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="text-gray-600">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              className={`w-full py-3 px-6 rounded-lg text-white font-semibold transition-all duration-300 shadow-lg ${
                loading
                  ? "bg-emerald-300 cursor-not-allowed"
                  : "bg-emerald-500 hover:bg-emerald-600"
              }`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="w-full md:w-1/2 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 text-white relative overflow-hidden flex items-center justify-center px-8 py-20">
        <div className="absolute inset-0">
          <img
            src={bglogin}
            alt="pattern"
            className="w-full h-full object-cover opacity-10 mix-blend-soft-light"
          />
        </div>
        <div className="absolute -top-10 -left-6 w-48 h-48 bg-white/10 rotate-12 rounded-2xl"></div>
        <div className="absolute -bottom-16 -right-10 w-56 h-56 bg-white/5 -rotate-12 rounded-3xl"></div>

        <div className="relative z-10 text-center max-w-lg space-y-6">
          <p className="uppercase tracking-[0.5em] text-lg  text-white/70">
            NDC RMS
          </p>
          <h2 className="text-4xl font-bold leading-tight">
            Repair & Maintenance System
          </h2>
          <p className="text-lg text-white/90">
            Streamline facility upkeep, monitor equipment status, and keep
            maintenance schedules on track with powerful workflow tools designed
            for NDC.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

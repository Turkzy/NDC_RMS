import React, { useState, useEffect } from "react";
import LOGIN from "../assets/Subheading.png";
import LOGO from "../assets/NDC.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Load remembered credentials on component mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    const rememberedPassword = localStorage.getItem("rememberedPassword");

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setPassword(rememberedPassword || "");
      setRememberMe(true);
    }
  }, []);

  const handlelogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(  
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );
      console.log("Login Response:", response.data);

      const { accessToken, user } = response.data;

      // Extract username from user object
      const username = user.username;

      // Save auth data including username
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("username", username); // Store username separately
      localStorage.setItem("lastLoginTime", Date.now().toString());

      // Remember me handling
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      // Navigate to dashboard after successful login
      navigate("/Dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login Failed");
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center select-none px-4 sm:px-6 md:px-8"
      style={{ backgroundImage: `url(${LOGIN})` }}
    >
      <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 md:p-10 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg border-2">
        <div className="flex flex-col items-center mb-4 sm:mb-6">
          <img src={LOGO} alt="Logo" className="h-24 sm:h-32 md:h-40" />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700 text-center font-montserrat">
            Ticketing Management System
          </h1>
        </div>
        {error && (
          <p className="text-red-100 text-center font-montserrat bg-red-500 rounded p-2 mb-4">
            {error}
          </p>
        )}
        <form className="space-y-4" onSubmit={handlelogin}>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Email
            </label>
            <input
              type="text"
              id="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="rememberMe" className="ml-2 text-sm text-gray-700">
              Remember me
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

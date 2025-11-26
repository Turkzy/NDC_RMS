import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Search, User, Menu } from "lucide-react";
import logo from "../assets/ndc_logo.png";

const Header = ({ onMenuClick, isSidebarCollapsed }) => {
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const getUserInitials = () => {
    if (!user) return "U";
    if (user.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return names[0][0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const getUserDisplayName = () => {
    if (!user) return "User";
    return user.name || user.email || "User";
  };

  const handleLogout = () => {
    if (isNavigating) return;

    setIsNavigating(true);

    // Clear all authentication-related data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastLoginTime");
    localStorage.removeItem("rememberedEmail");

    // Close user menu
    setShowUserMenu(false);

    // Navigate to login page
    navigate("/Admin", { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white opacity-90 backdrop-blur-sm shadow-sm border-b border-gray-200 select-none">
      <div className="flex items-center justify-between px-4 py-3 h-16">
        {/* Left Section - Logo and Menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="NDC Logo"
              className="h-14 w-14 object-contain"
            />
            {!isSidebarCollapsed && (
              <div className="hidden md:block">
                <h2 className="text-lg font-montserrat text-gray-80">
                  NDC RMS
                </h2>
                <p className="text-sm text-gray-500 font-montserrat">
                  Repair & Maintenance System
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 max-w-xl mx-4 hidden lg:block">
          <div className="relative">
            <Search
              size={20}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Section - Notifications and User */}
        <div className="flex items-center gap-3">
          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="User menu"
            >
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-semibold text-sm">
                {getUserInitials()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-gray-800">
                  {getUserDisplayName()}
                </p>
                {user?.email && (
                  <p className="text-xs text-gray-500">{user.username}</p>
                )}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowUserMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="p-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-800">
                      {getUserDisplayName()}
                    </p>
                    {user?.email && (
                      <p className="text-xs text-gray-500 truncate">
                        {user.username}
                      </p>
                    )}
                  </div>
                  <div className="p-1">
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile Settings
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

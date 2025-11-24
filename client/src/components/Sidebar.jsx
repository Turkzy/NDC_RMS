// components/Sidebar.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/ndc_logo.png";

const SidebarContext = createContext();

const Sidebar = ({ children, isCollapsed, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const contextValue = {
    expandedItems,
    toggleExpanded,
    isCollapsed,
  };

  return (
    <aside
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] z-40 bg-white select-none transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <nav className="h-full flex flex-col border-r border-gray-200 shadow-xl overflow-y-auto">
        <SidebarContext.Provider value={contextValue}>
          <ul className="flex-1 px-3 py-4">{children}</ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
};

export function SidebarItem({
  icon,
  text,
  active,
  notification,
  notificationCount, 
  onClick,
  dropdownIcon,
  children, 
  expandable = false, 
  itemId, 
}) {
  const { expandedItems, toggleExpanded, isCollapsed } =
    useContext(SidebarContext);
  const isExpanded = expandedItems[itemId] || false;

  const handleClick = () => {
    if (expandable && itemId && !isCollapsed) {
      toggleExpanded(itemId);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <li className="my-1">
      <div
        onClick={handleClick}
        className={`relative flex items-center ${
          isCollapsed ? "justify-center" : "justify-between"
        } h-10 py-2 px-3 font-medium rounded-md cursor-pointer transition-colors group ${
          active
            ? "bg-green-100 text-gray-600 shadow-sm border-l-4 border-green-500"
            : "hover:bg-green-200 text-gray-700"
        }`}
        title={isCollapsed ? text : undefined} // Show tooltip when collapsed
      >
        <div className="flex items-center">
          {icon}
          {!isCollapsed && (
            <span className="ml-3 transition-all duration-300">{text}</span>
          )}
        </div>

        {!isCollapsed && dropdownIcon && (
          <div
            className={`ml-auto transition-transform duration-200 text-gray-600 ${
              expandable && isExpanded ? "rotate-180" : "rotate-0"
            }`}
          >
            {dropdownIcon}
          </div>
        )}

        {notification && !isCollapsed && (
          <div className="absolute right-2 flex items-center">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            {notificationCount > 0 && (
              <span className="ml-1 text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">
                {notificationCount}
              </span>
            )}
          </div>
        )}

        {/* Notification indicator for collapsed state */}
        {notification && isCollapsed && (
          <div className="absolute -top-1 -right-1">
            <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Expandable content - only show when not collapsed */}
      {expandable && children && !isCollapsed && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <ul className="ml-6 mt-1 space-y-1">{children}</ul>
        </div>
      )}
    </li>
  );
}

export default Sidebar;

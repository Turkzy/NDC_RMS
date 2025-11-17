// components/Sidebar.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import Logo from "../assets/ndc_logo.png";

const SidebarContext = createContext();

const Sidebar = ({ children, isCollapsed, onToggle }) => {
  const [expandedItems, setExpandedItems] = useState({});

  const toggleExpanded = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const contextValue = {
    expandedItems,
    toggleExpanded,
    isCollapsed
  };

  return (
    <aside className={`sticky top-0 h-screen z-40 bg-white dark:bg-gray-800 select-none transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      <nav className="h-full flex flex-col border-r border-gray-200 dark:border-gray-700 shadow-xl">
        <div className={`p-4 pb-2 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
          <img src={Logo} alt="logo" className={`${isCollapsed ? 'w-8' : 'w-16'} transition-all duration-300`} />
          {!isCollapsed && (
            <h1 className="text-md font-semibold ml-2 text-gray-700 dark:text-gray-200 font-montserrat transition-all duration-300">
              Repair & Maintenance System
            </h1>
          )}
        </div>

        <SidebarContext.Provider value={contextValue}>
          <ul className="flex-1 px-3">{children}</ul>
        </SidebarContext.Provider>
      </nav>
    </aside>
  );
};

export function SidebarItem({
  icon,
  text,
  active,
  notification, // Replaces 'alert'
  notificationCount, // New prop for count
  onClick,
  dropdownIcon,
  children, // For expandable content
  expandable = false, // New prop to indicate if item is expandable
  itemId, // Unique identifier for expandable items
}) {
  const { expandedItems, toggleExpanded, isCollapsed } = useContext(SidebarContext);
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
        className={`relative flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-10 py-2 px-3 font-medium rounded-md cursor-pointer transition-colors group ${
          active
            ? "bg-green-300 dark:bg-green-600 text-gray-600 dark:text-gray-200"
            : "hover:bg-green-400 dark:hover:bg-green-700 text-gray-700 dark:text-gray-300"
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
          <div className={`ml-auto transition-transform duration-200 text-gray-600 dark:text-gray-300 ${
            expandable && isExpanded ? 'rotate-180' : 'rotate-0'
          }`}>
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
          <ul className="ml-6 mt-1 space-y-1">
            {children}
          </ul>
        </div>
      )}
    </li>
  );
}

export default Sidebar;

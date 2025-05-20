import React, { createContext, useContext, useState, useEffect } from "react";
import Logo from "../assets/NDC.png";

const SidebarContext = createContext();

const Sidebar = ({ children }) => {
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <aside className="sticky top-0 h-screen z-40 bg-white w-64 select-none">
      <nav className="h-full flex flex-col border-r shadow-xl">
        <div className="p-4 pb-2 flex items-center">
          <img src={Logo} alt="logo" className="w-16" />
          <h1 className="text-md font-semibold ml-2 text-gray-700 font-montserrat">NDC Request</h1>
        </div>

        <SidebarContext.Provider value={{}}>
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
  alert,
  onClick,
  dropdownIcon,
}) {
  return (
    <li
      onClick={onClick}
      className={`relative flex items-center justify-between h-10 py-2 px-3 my-1 font-medium rounded-md cursor-pointer transition-colors group ${
        active
          ? "bg-gradient-to-tr from-green-200 to-green-100 text-green-800"
          : "hover:bg-green-400 text-gray-600"
      }`}
    >
      <div className="flex items-center">
        {icon}
        <span className="ml-3">{text}</span>
      </div>

      {dropdownIcon && <div className="ml-auto">{dropdownIcon}</div>}

      {alert && (
        <div className="absolute right-2 w-2 h-2 rounded bg-green-400"></div>
      )}
    </li>
  );
}

export default Sidebar;

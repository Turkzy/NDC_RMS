import React, { useState } from "react";
import Sidebar, { SidebarItem } from "./Sidebar.jsx";
import {
  LayoutDashboard,
  ClipboardPenLine,
  ClipboardClock,
  FileCheck,
  FileText,
  UserCog,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState(null);
  const navigate = useNavigate(); // ✅ FIX

 // Inside Dashboard.jsx
const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastLoginTime");
    localStorage.removeItem("rememberedEmail"); // optional: clear remembered email on logout
  
    // Force update auth state across tabs
    window.dispatchEvent(new Event("storage"));
  
    // Redirect to login
    navigate("/", { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar>

        {/* Dashboard */}
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activePanel === "dashboard"}
          onClick={() => setActivePanel("dashboard")}
        />

        {/* Manage Concerns */}
        <SidebarItem
          icon={<ClipboardPenLine size={20} />}
          text="Manage Concerns"
          active={activePanel === "pending" || activePanel === "resolved"}
          expandable
          itemId="manage_concerns"
          dropdownIcon={<ChevronRight size={16} />}
        >
          <SidebarItem
            icon={<ClipboardClock size={20} />}
            text="Pending"
            active={activePanel === "pending"}
            onClick={() => setActivePanel("pending")}
          />
          <SidebarItem
            icon={<FileCheck size={20} />}
            text="Resolved"
            active={activePanel === "resolved"}
            onClick={() => setActivePanel("resolved")}
          />
        </SidebarItem>

        {/* Reports */}
        <SidebarItem
          icon={<FileText size={20} />}
          text="Reports"
          active={activePanel === "monthly_report" || activePanel === "yearly_report"}
          expandable
          itemId="reports"
          dropdownIcon={<ChevronRight size={16} />}
        >
          <SidebarItem
            icon={<FileText size={20} />}
            text="Monthly Report"
            active={activePanel === "monthly_report"}
            onClick={() => setActivePanel("monthly_report")}
          />
          <SidebarItem
            icon={<FileText size={20} />}
            text="Yearly Report"
            active={activePanel === "yearly_report"}
            onClick={() => setActivePanel("yearly_report")}
          />
        </SidebarItem>

        {/* Account */}
        <SidebarItem
          icon={<UserCog size={20} />}
          text="Account"
          active={activePanel === "account"}
          onClick={() => setActivePanel("account")}
        />

        {/* Logout (Now Working) */}
        <SidebarItem
          icon={<LogOut size={20} />}
          text="Logout"
          active={false}
          onClick={handleLogout}
        />

      </Sidebar>

      {/* Active Panel Display */}
      <div className="flex-1 p-10 text-3xl font-bold">
        {activePanel ? `You clicked: ${activePanel}` : "Select a tab"}
      </div>
    </div>
  );
};

export default Dashboard;

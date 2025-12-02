import React, { useState, useEffect, useRef } from "react";
import Sidebar, { SidebarItem } from "./Sidebar.jsx";
import {
  ClipboardClock,
  FileCheck,
  UserCog,
  LogOut,
  ChevronRight,
  Settings,
  Logs,
  FileText,
} from "lucide-react";
import { RiDashboardLine } from "react-icons/ri";
import {
  LuFileCog,
  LuFileChartPie,
  LuCalendarDays,
  LuCalendarRange,
} from "react-icons/lu";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// COMPONENTS
import Header from "./Header.jsx";

// PAGES
import DashboardPage from "../pages/Dashboard.jsx";
import PendingConcern from "../pages/Concerns/PendingConcern.jsx";
import ResolvedConcern from "../pages/Concerns/ResolvedConcern.jsx";
import AllConcern from "../pages/Concerns/AllConcern.jsx";

import SettingsPanel from "../pages/Settings.jsx";
import ActionLogs from "../pages/Actionlogs.jsx";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState("dashboard");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const isNavigatingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isNavigatingRef.current) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    if (!user || !token) {
      isNavigatingRef.current = true;
      navigate("/", { replace: true });
      return;
    }

    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;

      if (decoded.exp && decoded.exp < currentTime) {
        isNavigatingRef.current = true;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/", { replace: true });
        return;
      }
    } catch (error) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      isNavigatingRef.current = true;
      navigate("/", { replace: true });
      return;
    }
  }, [navigate]);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const accessibleTabs = () => {
    return {
      dashboard: true,
      pendingconcern: true,
      resolvedconcern: true,
      allconcerns: true,
      monthlyreport: true,
      yearlyreport: true,
      actionlogs: true,
      settings: true,
      logout: true,
    };
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      {/* Header - Full Width at Top */}
      <Header
        onMenuClick={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      {/* Sidebar and Content Area */}
      <div className="flex flex-1 overflow-hidden relative mt-16">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={toggleSidebar}>
          {/* Dashboard */}
          {accessibleTabs().dashboard && (
            <SidebarItem
              icon={<RiDashboardLine size={20} />}
              text="Dashboard"
              active={activePanel === "dashboard"}
              onClick={() => setActivePanel("dashboard")}
            />
          )}
          {/* Manage Concerns */}
          <SidebarItem
            icon={<LuFileCog size={20} />}
            text="Manage Concerns"
            active={
              activePanel.startsWith("manage_concerns") ||
              activePanel.startsWith("pending_concerns") ||
              activePanel.startsWith("resolved_concerns")
            }
            expandable={true}
            itemId="manage_concerns"
            dropdownIcon={<ChevronRight size={16} />}
          >
            <SidebarItem 
            icon={<FileText size={20} />}
            text="All Concerns"
            active={activePanel === "all_concerns"}
            onClick={() => setActivePanel("all_concerns")}
            />
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
            icon={<LuFileChartPie size={20} />}
            text="Reports"
            active={
              activePanel.startsWith("reports") ||
              activePanel.startsWith("monthly_report") ||
              activePanel.startsWith("yearly_report")
            }
            expandable={true}
            itemId="reports"
            dropdownIcon={<ChevronRight size={16} />}
          >
            <SidebarItem
              icon={<LuCalendarDays size={20} />}
              text="Monthly Report"
              active={activePanel === "monthly_report"}
              onClick={() => setActivePanel("monthly_report")}
            />
            <SidebarItem
              icon={<LuCalendarRange size={20} />}
              text="Yearly Report"
              active={activePanel === "yearly_report"}
              onClick={() => setActivePanel("yearly_report")}
            />
          </SidebarItem>
          <SidebarItem
            icon={<Logs size={20} />}
            text="Action Logs"
            active={activePanel === "action_logs"}
            onClick={() => setActivePanel("action_logs")}
          />
          <SidebarItem
            icon={<Settings size={20} />}
            text="Settings"
            active={activePanel === "settings"}
            onClick={() => setActivePanel("settings")}
          />
        </Sidebar>

        {/* Active Panel Display */}
        <div 
          className={`flex flex-col flex-1 overflow-hidden transition-all duration-300 ${
            isSidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <main className="flex-1 p-8 transition duration-300 overflow-y-auto">
            {activePanel === "dashboard" && <DashboardPage />}
            {activePanel === "pending" && <PendingConcern />}
            {activePanel === "resolved" && <ResolvedConcern />}
            {activePanel === "all_concerns" && <AllConcern />}
            {activePanel === "monthly_report" && (
              <div>Monthly Report Content</div>
            )}
            {activePanel === "yearly_report" && (
              <div>Yearly Report Content</div>
            )}
            {activePanel === "settings" && <SettingsPanel />}
            {activePanel === "action_logs" && <ActionLogs />}
          </main>
          <footer className="text-center text-black hover:text-green-600 transition duration-300 bg-white">
            <a href="https://johnalbertsison.vercel.app/">
              ©2025 Developed by TurkzyDev
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

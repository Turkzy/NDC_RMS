import React, { useEffect, useState } from "react";
import Sidebar, { SidebarItem } from "../components/Sidebar.jsx";
import {
  LayoutDashboard,
  SquareChartGantt,
  ClipboardPen,
  ChartPie,
  Calendar,
  ChevronUp,
  ChevronDown,
  Database,
  LogOut,
  Logs,
  UserPen,
  Clipboard,
  UserRoundCog,
  Users,
} from "lucide-react";
import DashboardPanel from "./DashboardPanel.jsx";
import Manage from "./Manage.jsx";
import RequestPanel from "./RequestPanel.jsx";
import ReportMonth from "./Reports.jsx";
import ReportYear from "./ReportsYear.jsx";
import DataEntry from "./DataEntry.jsx";
import { useNavigate } from "react-router-dom";
import RequestList from "./RequestList.jsx";
import LogsPanel from "./LogsPanel.jsx";
import AccountPanel from "./AccountPanel.jsx";
import AccountList from "./AccountList.jsx";

const Dashboard = () => {
  const [activePanel, setActivePanel] = useState("dashboard");
  const [reportDropdownOpen, setReportDropdownOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/admin");
          }
        } catch (error) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin");
        }
      } else {
        navigate("/admin");
      }
    };

    const tokenCheckInterval = setInterval(checkTokenExpiration, 600000);
    checkTokenExpiration();

    return () => {
      clearInterval(tokenCheckInterval);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <SidebarItem
          icon={<LayoutDashboard size={20} />}
          text="Dashboard"
          active={activePanel === "dashboard"}
          onClick={() => setActivePanel("dashboard")}
        />
        <SidebarItem
          icon={<Clipboard size={20} />}
          text="Request"
          active={activePanel === "request"}
          onClick={() => setActivePanel("request")}
        />
        <SidebarItem
          icon={<ClipboardPen size={20} />}
          text="Manage Request"
          active={activePanel === "managerequest"}
          onClick={() => setActivePanel("managerequest")}
        />
        <SidebarItem
          icon={<SquareChartGantt size={20} />}
          text="Manage"
          active={activePanel === "manage"}
          onClick={() => setActivePanel("manage")}
        />
        <hr />
        <SidebarItem
          icon={<ChartPie size={20} />}
          text="Reports"
          active={activePanel.startsWith("report")}
          onClick={() => setReportDropdownOpen(!reportDropdownOpen)}
          dropdownIcon={
            reportDropdownOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )
          }
        />
        {reportDropdownOpen && (
          <div className="ml-6">
            <SidebarItem
              icon={<Calendar size={20} />}
              text="Month"
              active={activePanel === "report-month"}
              onClick={() => setActivePanel("report-month")}
            />
            <SidebarItem
              icon={<Calendar size={20} />}
              text="Year / Quarterly"
              active={activePanel === "report-year"}
              onClick={() => setActivePanel("report-year")}
            />
          </div>
        )}
        <SidebarItem
          icon={<Database size={20} />}
          text="Data Entry"
          active={activePanel === "dataentry"}
          onClick={() => setActivePanel("dataentry")}
        />
        <SidebarItem
          icon={<Logs size={20} />}
          text="Logs"
          active={activePanel === "logs"}
          onClick={() => setActivePanel("logs")}
        />
        <hr />
        <SidebarItem
          icon={<UserRoundCog size={20} />}
          text="Accounts"
          active={activePanel.startsWith("acccount")}
          onClick={() => setAccountDropdownOpen(!accountDropdownOpen)}
          dropdownIcon={
            accountDropdownOpen ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )
          }
        />
        {accountDropdownOpen && (
          <div className="ml-6">
            <SidebarItem
              icon={<UserPen size={20} />}
              text="Profile"
              active={activePanel === "account"}
              onClick={() => setActivePanel("account")}
            />
            <SidebarItem
              icon={<Users size={20} />}
              text="Users Account"
              active={activePanel === "users-account"}
              onClick={() => setActivePanel("users-account")}
            />
          </div>
        )}
        <hr />
        <SidebarItem
          icon={<LogOut size={20} />}
          text="Logout"
          active={false}
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("lastLoginTime");
            localStorage.removeItem("rememberedEmail");
            localStorage.removeItem("rememberedPassword");
            window.location.href = "/Request/Admin";
          }}
        />
      </Sidebar>
      <div className="flex flex-col flex-1">
        <main className="flex-1 p-10 bg-slate-100 transition duration-300">
          {activePanel === "dashboard" && <DashboardPanel setActivePanel={setActivePanel}/>}
          {activePanel === "request" && <RequestList />}
          {activePanel === "managerequest" && <RequestPanel />}
          {activePanel === "manage" && <Manage />}
          {activePanel === "dataentry" && <DataEntry />}
          {activePanel === "report-year" && <ReportYear />}
          {activePanel === "report-month" && <ReportMonth />}
          {activePanel === "logs" && <LogsPanel />}
          {activePanel === "account" && <AccountPanel />}
          {activePanel === "users-account" && <AccountList />}
        </main>
        <footer className="text-center text-black hover:text-green-600 transition duration-300 bg-white">
          <a href="https://turzkyportfolio.netlify.app/">
            ©2025 Developed by TurkzyDev
          </a>
        </footer>
      </div>
    </div>
  );
};

export default Dashboard;

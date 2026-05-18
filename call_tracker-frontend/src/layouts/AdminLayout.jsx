import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt, FaUsers, FaPhone, FaChartLine,
  FaSignOutAlt, FaBars, FaUserPlus, FaBullseye,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { path: "/admin/dashboard", icon: <FaTachometerAlt />, label: "Dashboard",   short: "Home" },
  { path: "/admin/employees", icon: <FaUsers />,          label: "Employees",   short: "Staff" },
  { path: "/admin/calls",     icon: <FaPhone />,          label: "Calls",       short: "Calls" },
  { path: "/admin/reports",   icon: <FaChartLine />,      label: "Reports",     short: "Reports" },
  { path: "/admin/targets",   icon: <FaBullseye />,       label: "Targets",     short: "Targets" },
  { path: "/admin/register",  icon: <FaUserPlus />,       label: "Register User", short: "Register" },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const userName = user?.username || "Admin";
  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <div className="h-screen flex flex-col bg-slate-950 text-slate-100 overflow-hidden">

      {/* TOP HEADER */}
      <header className="h-14 shrink-0 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:block cursor-pointer p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <FaBars />
          </button>
          <div>
            <span className="font-semibold text-white text-sm">Call<span className="text-blue-500">Tracker</span> CRM</span>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Admin Panel</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm text-slate-300 hidden sm:inline">{userName}</span>
          </div>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 text-sm border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* SIDEBAR — desktop only */}
        <aside className={`hidden md:flex shrink-0 flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 overflow-hidden ${collapsed ? "w-[60px]" : "w-[220px]"}`}>
          <nav className="flex flex-col gap-1 p-3 flex-1">
            {NAV.map(({ path, icon, label }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors w-full text-left
                  ${isActive(path)
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent"
                  }
                  ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? label : undefined}
              >
                <span className="text-base shrink-0">{icon}</span>
                {!collapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 flex safe-area-inset-bottom">
        {NAV.map(({ path, icon, short }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-colors min-w-0 ${
              isActive(path) ? "text-blue-400" : "text-slate-500 active:text-slate-300"
            }`}
          >
            <span className="text-[15px] leading-none">{icon}</span>
            <span className="text-[9px] font-medium leading-none truncate w-full text-center px-0.5 mt-0.5">{short}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

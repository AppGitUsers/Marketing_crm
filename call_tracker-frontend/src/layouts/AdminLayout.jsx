import { useState } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaPhone,
  FaChartLine,
  FaSignOutAlt,
  FaBars,
  FaUserPlus,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [collapsed, setCollapsed] = useState(false);

  const userName = user?.username || "Admin";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const menuItemClass = (path) => {
    const active = location.pathname === path;

    return `cursor-pointer flex items-center transition-all duration-300 rounded-lg px-3 py-3 ${
      collapsed ? "justify-center gap-0" : "gap-3"
    } ${
      active
        ? "bg-cyan-400/20 text-cyan-300 shadow-[0_0_12px_#00f0ff]"
        : "text-cyan-500 hover:bg-cyan-400/10 hover:text-cyan-300"
    }`;
  };

  return (
    <div className="h-screen flex flex-col bg-[#000814] text-white overflow-hidden">
      <div className="h-[70px] flex items-center justify-between px-6 border-b border-cyan-400/30 backdrop-blur-md bg-black/30 shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="cursor-pointer flex items-center justify-center text-cyan-400 hover:text-white transition"
          >
            <FaBars />
          </button>

          <div className="flex flex-col">
            <h1 className="text-lg text-cyan-300 font-semibold tracking-wide">
              Admin Dashboard
            </h1>

            <p className="text-xs text-gray-400">
              Hello,{" "}
              <span className="text-cyan-400 font-medium">{userName}</span> 👋
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-semibold">
              {userName?.charAt(0)?.toUpperCase()}
            </div>

            <span className="text-sm text-cyan-200">{userName}</span>
          </div>

          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-cyan-400 rounded-md text-cyan-300 hover:bg-cyan-400 hover:text-black transition shadow-[0_0_10px_#00f0ff]"
          >
            <FaSignOutAlt className="text-sm" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`cursor-pointer bg-black/40 border-r border-cyan-400/20 p-4 flex flex-col gap-3 shrink-0 overflow-y-auto transition-all duration-300 ${
            collapsed ? "w-[80px]" : "w-[220px]"
          }`}
        >
          <button
            onClick={() => navigate("/admin/dashboard")}
            className={menuItemClass("/admin/dashboard")}
          >
            <FaTachometerAlt />
            {!collapsed && <span>Dashboard</span>}
          </button>

          <button
            onClick={() => navigate("/admin/employees")}
            className={menuItemClass("/admin/employees")}
          >
            <FaUsers />
            {!collapsed && <span>Employees</span>}
          </button>

          <button
            onClick={() => navigate("/admin/calls")}
            className={menuItemClass("/admin/calls")}
          >
            <FaPhone />
            {!collapsed && <span>Calls</span>}
          </button>

          <button
            onClick={() => navigate("/admin/reports")}
            className={menuItemClass("/admin/reports")}
          >
            <FaChartLine />
            {!collapsed && <span>Reports</span>}
          </button>

          <button
            onClick={() => navigate("/admin/register")}
            className={menuItemClass("/admin/register")}
          >
            <FaUserPlus />
            {!collapsed && <span>Register User</span>}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FaSignOutAlt, FaTachometerAlt, FaPhone, FaRedoAlt,
  FaUserFriends, FaCheckCircle, FaHandshake, FaFolderOpen,
} from "react-icons/fa";

const EMP_NAV = [
  { path: "/employee/dashboard",    icon: <FaTachometerAlt />, label: "Dashboard",   short: "Home" },
  { path: "/employee/my-calls",     icon: <FaPhone />,         label: "My Calls",    short: "Calls" },
  { path: "/employee/follow-ups",   icon: <FaRedoAlt />,       label: "Follow-Ups",  short: "Follow" },
  { path: "/employee/leads",        icon: <FaUserFriends />,   label: "Leads",       short: "Leads" },
  { path: "/employee/conversions",  icon: <FaCheckCircle />,   label: "Conversions", short: "Convert" },
  { path: "/employee/closed-deals", icon: <FaHandshake />,     label: "Closed Deals",short: "Closed" },
  { path: "/employee/projects",     icon: <FaFolderOpen />,    label: "Projects",    short: "Projects" },
];

export default function EmployeeLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const userName = user?.employee_name || user?.username || "Employee";
  const handleLogout = () => { logout(); navigate("/"); };
  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* HEADER */}
      <header className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div>
          <span className="font-semibold text-white text-sm">Call<span className="text-blue-500">Tracker</span> CRM</span>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Employee Portal</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProfile(true)}
            className="cursor-pointer flex items-center gap-2 px-2.5 py-1.5 text-sm border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{userName}</span>
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1.5 text-sm border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* DESKTOP NAVIGATION STRIP */}
      <nav className="hidden md:flex bg-slate-900 border-b border-slate-800 px-2 overflow-x-auto">
        {EMP_NAV.map(({ path, icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex items-center gap-2 px-3 py-2.5 text-sm whitespace-nowrap font-medium transition-colors border-b-2 ${
              isActive(path)
                ? "text-blue-400 border-blue-500"
                : "text-slate-400 hover:text-slate-200 border-transparent"
            }`}
          >
            <span className="text-xs">{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      {/* PAGE CONTENT */}
      <div className="p-4 md:p-6 pb-24">{children}</div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50 flex">
        {EMP_NAV.map(({ path, icon, short }) => (
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

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-full max-w-[400px] p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-base font-semibold text-white">{userName}</h2>
                  <p className="text-xs text-slate-400">Employee Profile</p>
                </div>
              </div>
              <button onClick={() => setShowProfile(false)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
            </div>

            {user ? (
              <div className="space-y-3 text-sm">
                {[
                  ["Employee ID", user.employee_id],
                  ["Department",  user.department],
                  ["Designation", user.designation],
                  ["Phone",       user.phone],
                  ["Email",       user.email],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-slate-800">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-100 text-right ml-4 truncate">{value || "—"}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">Loading...</p>
            )}

            <button
              onClick={() => setShowProfile(false)}
              className="cursor-pointer mt-5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

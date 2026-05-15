import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaSignOutAlt, FaUser } from "react-icons/fa";

export default function EmployeeLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const userName = user?.employee_name || user?.username || "Employee";

  const handleLogout = () => { logout(); navigate("/"); };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">

      {/* HEADER */}
      <header className="h-[60px] flex items-center justify-between px-5 bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div>
          <span className="font-semibold text-white text-sm">Call<span className="text-blue-500">Tracker</span> CRM</span>
          <p className="text-xs text-slate-500 leading-none mt-0.5">Employee Portal</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProfile(true)}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:inline">{userName}</span>
          </button>
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-sm border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FaSignOutAlt className="text-xs" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      <div className="p-6">{children}</div>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[400px] p-6">
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
                    <span className="text-slate-100">{value || "—"}</span>
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

import { useState } from "react";
import bg from "../assets/images/tech-bg.jpg";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function EmployeeLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);

  const userName = user?.employee_name || user?.username || "Employee";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-white"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-[#000814]/80"></div>

      <div className="relative z-10">
        <div className="h-[70px] flex items-center justify-between px-6 border-b border-cyan-400/30 backdrop-blur-md bg-black/30">
          <div className="flex flex-col">
            <h1 className="text-lg text-cyan-300 font-semibold tracking-wide">
              Employee Dashboard
            </h1>

            <p className="text-sm text-green-400 mt-1 font-medium">
              Welcome {userName} 👋
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className="cursor-pointer flex items-center gap-2"
              onClick={() => setShowProfile(true)}
            >
              <div className="w-9 h-9 rounded-full bg-cyan-400/20 border border-cyan-400 flex items-center justify-center text-cyan-300 font-semibold">
                {userName?.charAt(0)?.toUpperCase()}
              </div>

              <span className="text-sm text-cyan-200">{userName}</span>
            </div>

            <button
              onClick={handleLogout}
              className="cursor-pointer px-3 py-1 border border-cyan-400 rounded-md text-cyan-300 hover:bg-cyan-400 hover:text-black transition shadow-[0_0_10px_#00f0ff]"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="p-6">{children}</div>
      </div>

      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-[#020617] border border-cyan-400 rounded-xl p-6 w-[420px] shadow-[0_0_25px_#00f0ff]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-cyan-300 font-semibold">
                Employee Profile
              </h2>

              <button
                onClick={() => setShowProfile(false)}
                className="cursor-pointer text-cyan-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            {user ? (
              <div className="space-y-3 text-sm text-cyan-100">
                <p>
                  <span className="text-cyan-400">Employee ID:</span>{" "}
                  {user.employee_id || "-"}
                </p>
                <p>
                  <span className="text-cyan-400">Name:</span>{" "}
                  {user.employee_name || user.username || "-"}
                </p>
                <p>
                  <span className="text-cyan-400">Department:</span>{" "}
                  {user.department || "-"}
                </p>
                <p>
                  <span className="text-cyan-400">Designation:</span>{" "}
                  {user.designation || "-"}
                </p>
                <p>
                  <span className="text-cyan-400">Phone:</span>{" "}
                  {user.phone || "-"}
                </p>
                <p>
                  <span className="text-cyan-400">Email:</span>{" "}
                  {user.email || "-"}
                </p>
              </div>
            ) : (
              <p className="text-cyan-200">Loading profile...</p>
            )}

            <button
              onClick={() => setShowProfile(false)}
              className="cursor-pointer mt-6 w-full px-4 py-2 bg-cyan-400 text-black rounded-md font-semibold hover:opacity-90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
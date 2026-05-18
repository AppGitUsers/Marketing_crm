import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaPhoneAlt, FaCheckCircle, FaChartLine, FaCheckDouble, FaRedoAlt } from "react-icons/fa";
import api from "../../api/axios";

const STATUS_COLOR = {
  Interested:     "bg-blue-500/10 text-blue-400",
  Converted:      "bg-green-500/10 text-green-400",
  Closed:         "bg-slate-500/10 text-slate-400",
  "Follow Up":    "bg-yellow-500/10 text-yellow-400",
  "Not Interested": "bg-red-500/10 text-red-400",
  "Did Not Pick": "bg-orange-500/10 text-orange-400",
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [empRes, callRes] = await Promise.all([api.get("admin/employees/"), api.get("admin/calls/")]);
        setEmployees(empRes.data);
        setCalls(callRes.data);
      } catch (e) { console.log(e.response?.data); }
    })();
  }, []);

  const stats = [
    { label: "Employees",   value: employees.length,                                           icon: <FaUsers />,       route: "/admin/employees", color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Total Calls", value: calls.length,                                               icon: <FaPhoneAlt />,    route: "/admin/calls",     color: "text-slate-300",  bg: "bg-slate-500/10" },
    { label: "Leads",       value: calls.filter(c => c.status === "Interested").length,        icon: <FaChartLine />,   route: "/admin/calls",     color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Conversions", value: calls.filter(c => c.status === "Converted").length,         icon: <FaCheckCircle />, route: "/admin/calls",     color: "text-green-400",  bg: "bg-green-500/10" },
    { label: "Follow Ups",  value: calls.filter(c => c.status === "Follow Up").length,         icon: <FaRedoAlt />,     route: "/admin/calls",     color: "text-orange-400", bg: "bg-orange-500/10" },
    { label: "Closed Deals",value: calls.filter(c => c.status === "Closed").length,            icon: <FaCheckDouble />, route: "/admin/calls",     color: "text-slate-400",  bg: "bg-slate-500/10" },
  ];

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Overview of your CRM activity</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            onClick={() => navigate(s.route)}
            className="cursor-pointer bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-colors"
          >
            <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center ${s.color} text-xs mb-2`}>
              {s.icon}
            </div>
            <p className="text-slate-400 text-[10px] leading-tight">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* EMPLOYEES PREVIEW */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-slate-300">Recent Employees</h2>
          <button onClick={() => navigate("/admin/employees")} className="cursor-pointer text-xs text-blue-400 hover:text-blue-300">View all →</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {employees.length === 0 ? (
            <p className="text-slate-500 text-sm col-span-full">No employees yet.</p>
          ) : (
            employees.slice(0, 6).map((emp) => (
              <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-colors">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-semibold text-sm mb-2">
                  {emp.employee_name?.charAt(0)?.toUpperCase()}
                </div>
                <p className="text-slate-200 text-sm font-medium truncate">{emp.employee_name}</p>
                <p className="text-slate-500 text-xs truncate">{emp.email}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RECENT CALLS */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300">Recent Calls</h2>
          <button onClick={() => navigate("/admin/calls")} className="cursor-pointer text-xs text-blue-400 hover:text-blue-300">View all →</button>
        </div>
        {calls.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No calls recorded yet.</p>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="sm:hidden divide-y divide-slate-800">
              {calls.slice(0, 8).map((call) => (
                <div key={call.id} className="px-4 py-3 hover:bg-slate-800/40 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-100 text-sm font-medium truncate flex-1">{call.name}</p>
                    <span className={`ml-2 shrink-0 px-2 py-0.5 text-xs rounded-md ${STATUS_COLOR[call.status] || "bg-slate-500/10 text-slate-400"}`}>{call.status}</span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">{call.employee_name || "—"}{call.follow_up ? ` · ${call.follow_up}` : ""}</p>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                    <th className="px-4 py-2.5">Client</th>
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Follow Up</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.slice(0, 8).map((call) => (
                    <tr key={call.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-100">{call.name}</td>
                      <td className="px-4 py-3 text-slate-400">{call.employee_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-md ${STATUS_COLOR[call.status] || "bg-slate-500/10 text-slate-400"}`}>{call.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{call.follow_up || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

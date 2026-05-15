import { useEffect, useState } from "react";
import { FaPhoneAlt, FaChartLine, FaCheckCircle, FaClock, FaExclamationTriangle } from "react-icons/fa";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import api from "../../api/axios";

export default function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => { fetchReports(); }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("admin/reports/");
      setReport(res.data);
    } catch (e) { console.log(e.response?.data || e); }
  };

  if (!report) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading reports...
        </div>
      </div>
    );
  }

  const chartData = [
    { name: "Leads",       value: report.leads },
    { name: "Conversions", value: report.conversions },
    { name: "Closed",      value: report.closed_deals },
  ];

  const summaryCards = [
    { label: "Total Calls",     value: report.total_calls,       icon: <FaPhoneAlt />,            color: "text-blue-400",   bg: "bg-blue-500/10" },
    { label: "Leads",           value: report.leads,             icon: <FaChartLine />,           color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { label: "Conversions",     value: report.conversions,       icon: <FaCheckCircle />,         color: "text-green-400",  bg: "bg-green-500/10" },
    { label: "Today Follow-ups",value: report.today_followups,   icon: <FaClock />,               color: "text-slate-300",  bg: "bg-slate-500/10" },
    { label: "Overdue",         value: report.overdue_followups, icon: <FaExclamationTriangle />, color: "text-red-400",    bg: "bg-red-500/10" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Reports & Analytics</h1>
        <p className="text-sm text-slate-400 mt-0.5">Overview of CRM performance</p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {summaryCards.map((s) => (
          <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center ${s.color} text-sm mb-3`}>
              {s.icon}
            </div>
            <p className="text-slate-400 text-xs">{s.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-slate-300 mb-4">CRM Analytics</h2>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
              cursor={{ fill: "rgba(59,130,246,0.08)" }}
            />
            <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EMPLOYEE PERFORMANCE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-slate-800">
          <h2 className="text-sm font-semibold text-slate-300">Employee Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                <th className="px-4 py-2.5">Employee</th>
                <th className="px-4 py-2.5 text-center">Total Calls</th>
                <th className="px-4 py-2.5 text-center">Conversions</th>
                <th className="px-4 py-2.5 text-center">Closed Deals</th>
              </tr>
            </thead>
            <tbody>
              {report.employee_performance.map((emp) => (
                <tr key={emp.employee_id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-slate-100">{emp.employee_name}</td>
                  <td className="px-4 py-3 text-center text-slate-300">{emp.total_calls}</td>
                  <td className="px-4 py-3 text-center text-green-400">{emp.conversions}</td>
                  <td className="px-4 py-3 text-center text-slate-400">{emp.closed_deals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TODAY FOLLOW-UPS */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-slate-300">Today's Follow-ups</h2>
          </div>
          {report.today_followup_calls.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No follow-ups today</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {report.today_followup_calls.map((call) => (
                <div key={call.id} className="px-4 py-3">
                  <p className="text-slate-100 text-sm font-medium">{call.name}</p>
                  <p className="text-slate-500 text-xs">{call.phone}</p>
                  <p className="text-blue-400 text-xs mt-0.5">{call.employee_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* OVERDUE */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800">
            <h2 className="text-sm font-semibold text-red-400">Overdue Follow-ups</h2>
          </div>
          {report.overdue_calls.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-6">No overdue follow-ups</p>
          ) : (
            <div className="divide-y divide-slate-800">
              {report.overdue_calls.map((call) => (
                <div key={call.id} className="px-4 py-3">
                  <p className="text-slate-100 text-sm font-medium">{call.name}</p>
                  <p className="text-red-400 text-xs">Follow-up: {call.follow_up}</p>
                  <p className="text-blue-400 text-xs mt-0.5">{call.employee_name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

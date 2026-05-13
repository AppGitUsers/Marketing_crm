import { useEffect, useState } from "react";
import {
  FaPhoneAlt,
  FaChartLine,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import api from "../../api/axios";

export default function Reports() {
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get("admin/reports/");
      setReport(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };

  if (!report) {
    return (
      <div className="text-cyan-300 text-center py-10">
        Loading reports...
      </div>
    );
  }

  const chartData = [
    {
      name: "Leads",
      value: report.leads,
    },
    {
      name: "Conversions",
      value: report.conversions,
    },
    {
      name: "Closed",
      value: report.closed_deals,
    },
  ];

  return (
    <div>
      <h2 className="text-2xl text-cyan-300 mb-6">
        Reports & Analytics
      </h2>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff]">
          <FaPhoneAlt className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Total Calls</p>

          <h3 className="text-2xl text-green-400 font-semibold">
            {report.total_calls}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff]">
          <FaChartLine className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Leads</p>

          <h3 className="text-2xl text-green-400 font-semibold">
            {report.leads}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff]">
          <FaCheckCircle className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Conversions</p>

          <h3 className="text-2xl text-green-400 font-semibold">
            {report.conversions}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff]">
          <FaClock className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">
            Today Followups
          </p>

          <h3 className="text-2xl text-green-400 font-semibold">
            {report.today_followups}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-red-400/30 shadow-[0_0_10px_#ff0000]">
          <FaExclamationTriangle className="text-red-400 mb-2" />
          <p className="text-gray-400 text-sm">Overdue</p>

          <h3 className="text-2xl text-red-400 font-semibold">
            {report.overdue_followups}
          </h3>
        </div>

      </div>

      {/* CHART */}
      <div className="bg-white/10 p-5 rounded-xl border border-cyan-400/30 mb-8">
        <h3 className="text-cyan-300 mb-4">
          CRM Analytics
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#67e8f9" />
            <YAxis stroke="#67e8f9" />
            <Tooltip />

            <Bar
              dataKey="value"
              fill="#22d3ee"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* EMPLOYEE PERFORMANCE */}
      <div className="bg-white/10 p-5 rounded-xl border border-cyan-400/30 mb-8">

        <h3 className="text-cyan-300 mb-4">
          Employee Performance
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-white text-sm">

            <thead className="border-b border-cyan-400/30 text-cyan-300">
              <tr>
                <th className="text-left py-3">
                  Employee
                </th>

                <th>Total Calls</th>
                <th>Conversions</th>
                <th>Closed Deals</th>
              </tr>
            </thead>

            <tbody>
              {report.employee_performance.map((emp) => (
                <tr
                  key={emp.employee_id}
                  className="border-b border-gray-700"
                >
                  <td className="py-3">
                    {emp.employee_name}
                  </td>

                  <td className="text-center">
                    {emp.total_calls}
                  </td>

                  <td className="text-center text-green-400">
                    {emp.conversions}
                  </td>

                  <td className="text-center text-cyan-400">
                    {emp.closed_deals}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

      {/* TODAY FOLLOWUPS */}
      <div className="bg-white/10 p-5 rounded-xl border border-cyan-400/30 mb-8">

        <h3 className="text-cyan-300 mb-4">
          Today Followups
        </h3>

        {report.today_followup_calls.length === 0 ? (
          <p className="text-gray-400">
            No followups today
          </p>
        ) : (
          report.today_followup_calls.map((call) => (
            <div
              key={call.id}
              className="border-b border-gray-700 py-3"
            >
              <p className="text-white">
                {call.name}
              </p>

              <p className="text-sm text-gray-400">
                {call.phone}
              </p>

              <p className="text-sm text-cyan-300">
                Employee: {call.employee_name}
              </p>
            </div>
          ))
        )}

      </div>

      {/* OVERDUE */}
      <div className="bg-white/10 p-5 rounded-xl border border-red-400/30">

        <h3 className="text-red-400 mb-4">
          Overdue Followups
        </h3>

        {report.overdue_calls.length === 0 ? (
          <p className="text-gray-400">
            No overdue followups
          </p>
        ) : (
          report.overdue_calls.map((call) => (
            <div
              key={call.id}
              className="border-b border-gray-700 py-3"
            >
              <p className="text-white">
                {call.name}
              </p>

              <p className="text-sm text-red-400">
                Follow-up: {call.follow_up}
              </p>

              <p className="text-sm text-cyan-300">
                Employee: {call.employee_name}
              </p>
            </div>
          ))
        )}

      </div>
    </div>
  );
}
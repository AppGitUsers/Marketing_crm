import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaPhoneAlt,
  FaCheckCircle,
  FaChartLine,
  FaCheckDouble,
} from "react-icons/fa";
import api from "../../api/axios";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [calls, setCalls] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [empRes, callRes] = await Promise.all([
          api.get("admin/employees/"),
          api.get("admin/calls/"),
        ]);

        setEmployees(empRes.data);
        setCalls(callRes.data);
      } catch (error) {
        console.log(error.response?.data || error);
      }
    };

    loadData();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl text-cyan-300 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:grid-cols-5">
        <div
          onClick={() => navigate("/admin/employees")}
          className="cursor-pointer bg-white/10 p-4 rounded-xl border border-cyan-400/30 hover:shadow-[0_0_20px_#00f0ff] transition"
        >
          <FaUsers className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Employees</p>
          <h3 className="text-xl text-cyan-300">{employees.length}</h3>
        </div>

        <div
          onClick={() => navigate("/admin/calls")}
          className="cursor-pointer bg-white/10 p-4 rounded-xl border border-cyan-400/30 hover:shadow-[0_0_20px_#00f0ff] transition"
        >
          <FaPhoneAlt className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Calls</p>
          <h3 className="text-xl text-cyan-300">{calls.length}</h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 hover:shadow-[0_0_20px_#00f0ff] transition">
          <FaChartLine className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Leads</p>
          <h3 className="text-xl text-cyan-300">
            {calls.filter((c) => c.status === "Interested").length}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 hover:shadow-[0_0_20px_#00f0ff] transition">
          <FaCheckCircle className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Conversions</p>
          <h3 className="text-xl text-cyan-300">
            {calls.filter((c) => c.status === "Converted").length}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 hover:shadow-[0_0_20px_#00f0ff] transition">
          <FaPhoneAlt className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Follow Ups</p>
          <h3 className="text-xl text-cyan-300">
            {calls.filter((c) => c.status === "Follow Up").length}
          </h3>
        </div>

        <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 hover:shadow-[0_0_20px_#00f0ff] transition">
          <FaCheckDouble className="text-cyan-300 mb-2" />
          <p className="text-gray-400 text-sm">Closed Deals</p>
          <h3 className="text-xl text-cyan-300">
            {calls.filter((c) => c.status === "Closed").length}
          </h3>
        </div>
      </div>

      <div className="mb-8 mt-8">
        <h3 className="text-cyan-300 mb-3">Employees</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {employees.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center">
              No employees
            </p>
          ) : (
            employees.slice(0, 6).map((emp) => (
              <div
                key={emp.id}
                className="bg-white/10 p-3 rounded-lg border border-cyan-400/30"
              >
                <p className="text-cyan-300 text-sm font-semibold truncate">
                  {emp.employee_name}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {emp.email}
                </p>
                <p className="text-green-400 text-xs">
                  ₹ {emp.salary || 0}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 overflow-x-auto">
        {calls.length === 0 ? (
          <p className="text-gray-400 text-center">No calls</p>
        ) : (
          <table className="w-full text-sm text-white table-fixed">

            <thead className="text-cyan-300 border-b border-cyan-400/30">
              <tr className="text-left">

                <th className="py-3 px-4 w-[25%]">
                  Client
                </th>

                <th className="py-3 px-4 w-[25%]">
                  Employee
                </th>

                <th className="py-3 px-4 w-[25%] text-center">
                  Status
                </th>

                <th className="py-3 px-4 w-[25%] text-center">
                  Follow Up
                </th>

              </tr>
            </thead>

            <tbody>
              {calls.slice(0, 5).map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-gray-700 hover:bg-white/5 transition"
                >

                  <td className="py-3 px-4 truncate">
                    {call.name}
                  </td>

                  <td className="py-3 px-4 truncate text-cyan-200">
                    {call.employee_name || "-"}
                  </td>

                  <td className="px-4 text-center">
                    {call.status}
                  </td>

                  <td className="px-4 text-center">
                    {call.follow_up || "-"}
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}
      </div>
    </div>
  );
}
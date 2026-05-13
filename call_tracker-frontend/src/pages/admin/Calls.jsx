import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../api/axios";

export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    project: "",
    status: "Interested",
    follow_up: "",
    employee: "",
    notes: "",
  });

  const input =
    "w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchData = async () => {
    try {
      const [callsRes, empRes] = await Promise.all([
        api.get("admin/calls/"),
        api.get("admin/employees/"),
      ]);

      setCalls(callsRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.phone) {
      alert("Fill required fields");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        project: form.project,
        status: form.status,
        follow_up: form.follow_up || null,
        notes: form.notes,
        employee_id: form.employee || null,
      };

      if (editId) {
        await api.put(`admin/calls/${editId}/`, payload);
      } else {
        await api.post("admin/calls/", payload);
      }

      await fetchData();
      setShowModal(false);
      setEditId(null);
      setForm({
        name: "",
        phone: "",
        project: "",
        status: "Interested",
        follow_up: "",
        employee: "",
        notes: "",
      });
    } catch (error) {
      console.log(error.response?.data || error);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this call?");
    if (!ok) return;

    try {
      await api.delete(`admin/calls/${id}/`);
      await fetchData();
    } catch (error) {
      console.log(error.response?.data || error);
      alert("Delete failed");
    }
  };

  const handleEdit = (call) => {
    setEditId(call.id);
    setForm({
      name: call.name || "",
      phone: call.phone || "",
      project: call.project || "",
      status: call.status || "Interested",
      follow_up: call.follow_up || "",
      employee: call.employee_id ? String(call.employee_id) : "",
      notes: call.notes || "",
    });
    setShowModal(true);
  };

  const getCallDate = (call) => {
    return call.created_at ? call.created_at.slice(0, 10) : "";
  };

  const dateFilteredCalls = useMemo(() => {
    if (!selectedDate) return calls;
    return calls.filter((call) => getCallDate(call) === selectedDate);
  }, [calls, selectedDate]);

  const employeeCards = useMemo(() => {
    return employees.map((emp) => {
      const empCalls = dateFilteredCalls.filter(
        (c) => c.employee_id === emp.id
      );

      return {
        id: emp.id,
        employee_name: emp.employee_name,
        total: empCalls.length,
        interested: empCalls.filter((c) => c.status === "Interested").length,
        followUp: empCalls.filter((c) => c.status === "Follow Up").length,
        converted: empCalls.filter((c) => c.status === "Converted").length,
        closed: empCalls.filter((c) => c.status === "Closed").length,
        notInterested: empCalls.filter((c) => c.status === "Not Interested")
          .length,
      };
    });
  }, [employees, dateFilteredCalls]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    const result = dateFilteredCalls.filter((c) => {
      const matchesSearch =
        c.name?.toLowerCase().includes(s) ||
        c.phone?.includes(search) ||
        c.project?.toLowerCase().includes(s) ||
        c.employee_name?.toLowerCase().includes(s) ||
        c.status?.toLowerCase().includes(s);

      const matchesStatus =
        statusFilter === "All" || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    if (sortType === "date") {
      return [...result].sort(
        (a, b) =>
          new Date(a.created_at || 0) - new Date(b.created_at || 0)
      );
    }

    if (sortType === "status") {
      return [...result].sort((a, b) =>
        (a.status || "").localeCompare(b.status || "")
      );
    }

    return result;
  }, [dateFilteredCalls, search, statusFilter, sortType]);

  const getStatusColor = (status) => {
    switch (status) {
      case "Interested":
        return "bg-yellow-500/20 text-yellow-400";
      case "Converted":
        return "bg-green-500/20 text-green-400";
      case "Closed":
        return "bg-blue-500/20 text-blue-400";
      case "Follow Up":
        return "bg-cyan-500/20 text-cyan-400";
      default:
        return "bg-red-500/20 text-red-400";
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setForm({
      name: "",
      phone: "",
      project: "",
      status: "Interested",
      follow_up: "",
      employee: "",
      notes: "",
    });
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-cyan-300 text-xl">Calls Summary</h2>

        <button
          onClick={openAddModal}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-cyan-400 text-black rounded shadow"
        >
          <FaPlus /> Add Call
        </button>
      </div>

      {/* DATE FILTER */}
      <div className="mb-5 flex flex-col md:flex-row md:items-center gap-3">
        <div className="w-full md:w-[260px]">
          <label className="flex items-center gap-2 text-cyan-300 text-sm mb-2">
            <FaCalendarAlt />
            Select Date
          </label>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            onClick={(e) => e.currentTarget.showPicker?.()}
            className="w-full px-4 py-2 bg-[#020617] border border-cyan-400 text-white rounded shadow-[0_0_8px_#00f0ff] focus:outline-none cursor-pointer"
          />
        </div>

        <div className="text-sm text-gray-400 mt-6 md:mt-0">
          {selectedDate ? (
            <span>
              Showing data for:{" "}
              <span className="text-cyan-300 font-semibold">
                {selectedDate}
              </span>
            </span>
          ) : (
            <span>Showing all dates</span>
          )}
        </div>
      </div>

      {/* EMPLOYEE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {employeeCards.length === 0 ? (
          <p className="text-gray-400">No employees found</p>
        ) : (
          employeeCards.map((emp) => (
            <div
              key={emp.id}
              className="bg-white/10 border border-cyan-400/30 rounded-xl p-4 shadow-[0_0_10px_#00f0ff]"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-cyan-300 text-lg font-semibold truncate">
                  {emp.employee_name}
                </h3>
                <span className="text-xs text-gray-400">
                  {selectedDate || "All Dates"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-300">
                  Calls Added:{" "}
                  <span className="text-cyan-300">{emp.total}</span>
                </p>
                <p className="text-gray-300">
                  Interested:{" "}
                  <span className="text-yellow-400">{emp.interested}</span>
                </p>
                <p className="text-gray-300">
                  Follow Up:{" "}
                  <span className="text-cyan-400">{emp.followUp}</span>
                </p>
                <p className="text-gray-300">
                  Converted:{" "}
                  <span className="text-green-400">{emp.converted}</span>
                </p>
                <p className="text-gray-300">
                  Closed:{" "}
                  <span className="text-blue-400">{emp.closed}</span>
                </p>
                <p className="text-gray-300">
                  Not Interested:{" "}
                  <span className="text-red-400">{emp.notInterested}</span>
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="w-full md:w-[40%]">
          <input
            type="text"
            placeholder="Search calls..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2 bg-[#020617] border border-cyan-400 text-white rounded shadow-[0_0_8px_#00f0ff] focus:outline-none"
          />
        </div>

        <div className="flex gap-3 justify-end w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-[#020617] border border-cyan-400 text-cyan-300 rounded shadow-[0_0_8px_#00f0ff] focus:outline-none"
          >
            <option className="bg-[#020617]" value="All">
              All
            </option>
            <option className="bg-[#020617]" value="Interested">
              Interested
            </option>
            <option className="bg-[#020617]" value="Follow Up">
              Follow Up
            </option>
            <option className="bg-[#020617]" value="Converted">
              Converted
            </option>
            <option className="bg-[#020617]" value="Closed">
              Closed
            </option>
            <option className="bg-[#020617]" value="Not Interested">
              Not Interested
            </option>
          </select>

          <select
            value={sortType}
            onChange={(e) => setSortType(e.target.value)}
            className="cursor-pointer px-3 py-2 bg-[#020617] border border-cyan-400 text-cyan-300 rounded shadow-[0_0_8px_#00f0ff] focus:outline-none"
          >
            <option className="bg-[#020617]" value="">
              Sort
            </option>
            <option className="bg-[#020617]" value="date">
              Created Date
            </option>
            <option className="bg-[#020617]" value="status">
              Status
            </option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400">No calls</p>
        ) : (
          <table className="w-full text-white text-sm border-collapse">
            <thead className="text-cyan-300 border-b border-cyan-400/30">
              <tr className="text-left">
                <th className="py-3 px-4 w-[18%]">Client</th>
                <th className="px-4 w-[15%]">Phone</th>
                <th className="px-4 w-[15%]">Project</th>
                <th className="px-4 w-[15%]">Employee</th>
                <th className="px-4 w-[12%]">Status</th>
                <th className="px-4 w-[15%]">Follow Up</th>
                <th className="px-4 w-[10%] text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-gray-700 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3 align-middle truncate">
                    {call.name}
                  </td>

                  <td className="px-4 align-middle">{call.phone}</td>

                  <td className="px-4 align-middle truncate">
                    {call.project || "-"}
                  </td>

                  <td className="px-4 align-middle">
                    {call.employee_name || "-"}
                  </td>

                  <td className="px-4 align-middle">
                    <span
                      className={`px-2 py-1 rounded text-xs bg-white/10 ${getStatusColor(
                        call.status
                      )}`}
                    >
                      {call.status}
                    </span>
                  </td>

                  <td className="px-4 align-middle">
                    {call.follow_up || "-"}
                  </td>

                  <td className="px-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={() => handleEdit(call)}
                        className="cursor-pointer text-cyan-400 hover:text-white hover:bg-white/10 p-2 rounded-full hover:scale-110 transition drop-shadow-[0_0_6px_#00f0ff]"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(call.id)}
                        className="cursor-pointer text-red-400 hover:text-white hover:bg-white/10 p-2 rounded-full hover:scale-110 transition drop-shadow-[0_0_6px_#00f0ff]"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="bg-[#020617] p-6 rounded-xl w-[400px] border border-cyan-400 relative">
            <button
              onClick={() => setShowModal(false)}
              className="cursor-pointer absolute right-4 top-4 text-gray-300 hover:text-white"
            >
              <FaTimes />
            </button>

            <h3 className="text-cyan-300 mb-4 text-center">
              {editId ? "Edit Call" : "Add Call"}
            </h3>

            <input
              name="name"
              placeholder="Client Name"
              value={form.name}
              onChange={handleChange}
              className={input}
            />

            <input
              name="phone"
              placeholder="Phone"
              value={form.phone}
              onChange={handleChange}
              className={input}
            />

            <input
              name="project"
              placeholder="Project"
              value={form.project}
              onChange={handleChange}
              className={input}
            />

            <select
              name="employee"
              value={form.employee}
              onChange={handleChange}
              className={input}
            >
              <option value="">Assign Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employee_name}
                </option>
              ))}
            </select>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={input}
            >
              <option value="Interested">Interested</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Converted">Converted</option>
              <option value="Closed">Closed</option>
              <option value="Not Interested">Not Interested</option>
            </select>

            <input
              type="date"
              name="follow_up"
              value={form.follow_up}
              onChange={handleChange}
              className={input}
            />

            <textarea
              name="notes"
              placeholder="Notes"
              value={form.notes}
              onChange={handleChange}
              className={input}
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-cyan-400 text-black py-2 rounded mt-2 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
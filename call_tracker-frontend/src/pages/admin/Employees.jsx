import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaEdit, FaArrowLeft } from "react-icons/fa";
import bg from "../../assets/images/tech-bg.jpg";
import api from "../../api/axios";

const initialForm = {
  employee_name: "",
  username: "",
  email: "",
  phone: "",
  department: "",
  designation: "Employee",
  salary: "",
  password: "",
  is_active: true,
};

export default function Employees() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("admin/employees/");
      setEmployees(response.data);
    } catch (error) {
      console.log(error.response?.data || error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "is_active" ? value === "true" : value,
    }));
  };

  const openCreate = () => {
    setEditId(null);
    setForm(initialForm);
    setShowModal(true);
  };

  const openEdit = (emp) => {
    setEditId(emp.id);
    setForm({
      employee_name: emp.employee_name || "",
      username: emp.username || "",
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department || "",
      designation: emp.designation || "Employee",
      salary: emp.salary || "",
      password: "",
      is_active: emp.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (
      !form.employee_name ||
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.department ||
      !form.designation ||
      !form.salary
    ) {
      alert("Fill all required fields");
      return;
    }

    if (!editId && !form.password) {
      alert("Password is required for new employee");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        employee_name: form.employee_name,
        username: form.username,
        email: form.email,
        phone: form.phone,
        department: form.department,
        designation: form.designation,
        salary: form.salary,
        is_active: form.is_active,
      };

      if (form.password) {
        payload.password = form.password;
      }

      let response;

      if (editId) {
        response = await api.put(`admin/employees/${editId}/`, payload);
      } else {
        response = await api.post("admin/employees/", payload);
      }

      await fetchEmployees();

      if (!editId && response?.data?.generated_password) {
        alert(
          `Employee created successfully.\nTemporary password: ${response.data.generated_password}`
        );
      } else {
        alert("Saved successfully");
      }

      setShowModal(false);
      setEditId(null);
      setForm(initialForm);
    } catch (error) {
      console.log(error.response?.data || error);
      alert("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this employee?");
    if (!ok) return;

    try {
      await api.delete(`admin/employees/${id}/`);
      await fetchEmployees();
    } catch (error) {
      console.log(error.response?.data || error);
      alert("Delete failed");
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    return (
      emp.employee_name?.toLowerCase().includes(q) ||
      emp.username?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.phone?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="min-h-screen bg-cover bg-center relative text-white"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-[#000814]/80"></div>

      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl text-cyan-300">Employees</h2>

          <button
            onClick={() => navigate("/admin/dashboard")}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-300 rounded-md hover:bg-cyan-400 hover:text-black transition shadow-[0_0_10px_#00f0ff]"
          >
            <FaArrowLeft /> Dashboard
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredEmployees.length === 0 ? (
            <p className="text-gray-400 col-span-full text-center py-6">
              No employees found
            </p>
          ) : (
            filteredEmployees.map((emp) => (
              <div
                key={emp.id}
                className="bg-white/10 backdrop-blur-md p-4 rounded-lg border border-cyan-400/30 shadow-[0_0_8px_#00f0ff] hover:shadow-[0_0_15px_#00f0ff] transition"
              >
                <div className="w-8 h-8 rounded-full bg-cyan-400/20 flex items-center justify-center text-cyan-300 text-sm font-bold mb-2">
                  {emp.employee_name?.charAt(0)?.toUpperCase() || "E"}
                </div>

                <h3 className="text-sm text-cyan-300 font-semibold truncate">
                  {emp.employee_name}
                </h3>

                <p className="text-xs text-gray-400 truncate">
                  {emp.username}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  {emp.email}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  {emp.phone}
                </p>

                <p className="text-xs text-gray-400 truncate">
                  {emp.department} • {emp.designation}
                </p>

                <p className="text-xs text-green-400">
                  ₹ {emp.salary}
                </p>

                <span
                  className={`inline-block mt-2 px-2 py-0.5 text-[10px] rounded ${
                    emp.is_active
                      ? "bg-green-500/20 text-green-400"
                      : "bg-red-500/20 text-red-400"
                  }`}
                >
                  {emp.is_active ? "Active" : "Inactive"}
                </span>

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => openEdit(emp)}
                    className="text-cyan-400 hover:text-white text-xs"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(emp.id)}
                    className="text-red-400 hover:text-white text-xs"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <button
          onClick={openCreate}
          className="cursor-pointer fixed bottom-6 right-6 px-6 py-3 bg-cyan-400 text-black rounded-full shadow-[0_0_15px_#00f0ff]"
        >
          + Add Employee
        </button>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
            <div className="relative bg-[#020617] p-6 rounded-xl w-[420px] border border-cyan-400/30 shadow-[0_0_20px_#00f0ff]">
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer absolute top-3 right-3 text-gray-400 hover:text-red-400 text-lg"
              >
                ✕
              </button>

              <h2 className="text-cyan-300 text-center mb-5 text-lg font-semibold">
                {editId ? "Edit Employee" : "Add Employee"}
              </h2>

              <input
                name="employee_name"
                placeholder="Employee Name"
                value={form.employee_name}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <input
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <input
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <input
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <input
                name="department"
                placeholder="Department"
                value={form.department}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <select
                name="designation"
                value={form.designation}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-[#020617] text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>

              <input
                name="salary"
                placeholder="Salary"
                value={form.salary}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <select
                name="is_active"
                value={form.is_active ? "true" : "false"}
                onChange={handleChange}
                className="w-full mb-3 px-3 py-2 border border-cyan-400 bg-[#020617] text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>

              <input
                name="password"
                type="password"
                placeholder={
                  editId
                    ? "New password (leave blank to keep same)"
                    : "Password"
                }
                value={form.password}
                onChange={handleChange}
                className="w-full mb-2 px-3 py-2 border border-cyan-400 bg-transparent text-white rounded focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />

              <p className="text-[11px] text-gray-400 mb-4">
                {editId
                  ? "Leave password blank if you do not want to change it."
                  : "If blank, a temporary password will be generated."}
              </p>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer w-1/2 border border-gray-500 text-gray-300 py-2 rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer w-1/2 bg-cyan-400 text-black py-2 rounded shadow-[0_0_10px_#00f0ff] hover:shadow-[0_0_20px_#00f0ff] transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
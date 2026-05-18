import { useEffect, useMemo, useState } from "react";
import { FaTrash, FaEdit, FaPlus } from "react-icons/fa";
import api from "../../api/axios";

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";
const SELECT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-colors";

const createEmptyForm = () => ({
  employee_name: "",
  username: "",
  email: "",
  phone: "",
  department: "",
  designation: "Employee",
  salary: "",
  password: "",
  is_active: true,
});

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [editId, setEditId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(createEmptyForm());

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("admin/employees/");
      setEmployees(response.data);
    } catch (error) { console.log(error.response?.data || error); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: name === "is_active" ? value === "true" : value }));
  };

  const openCreate = () => { setEditId(null); setForm(createEmptyForm()); setShowModal(true); };

  const openEdit = (emp) => {
    setEditId(emp.id);
    setForm({
      employee_name: emp.employee_name || "",
      username: emp.username || "",
      email: emp.email || "",
      phone: emp.phone || "",
      department: emp.department || "",
      designation: emp.designation || "Employee",
      salary: emp.salary ?? "",
      password: "",
      is_active: emp.is_active ?? true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.employee_name || !form.username || !form.email || !form.phone || !form.department || !form.designation || !form.salary) {
      alert("Fill all required fields"); return;
    }
    if (!editId && !form.password) { alert("Password is required for new employee"); return; }

    setSaving(true);
    try {
      const payload = {
        employee_name: form.employee_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        designation: form.designation,
        salary: form.salary,
        is_active: form.is_active,
      };
      if (form.password) payload.password = form.password;

      let response;
      if (editId) {
        response = await api.put(`admin/employees/${editId}/`, payload);
      } else {
        response = await api.post("admin/employees/", payload);
      }
      await fetchEmployees();
      if (!editId && response?.data?.generated_password) {
        alert(`Employee created.\nTemporary password: ${response.data.generated_password}`);
      } else { alert("Saved successfully"); }
      setShowModal(false); setEditId(null); setForm(createEmptyForm());
    } catch (error) {
      console.log(error.response?.data || error); alert("Save failed");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api.delete(`admin/employees/${id}/`); await fetchEmployees();
    } catch { alert("Delete failed"); }
  };

  const filteredEmployees = useMemo(() => {
    const q = search.toLowerCase();
    return employees.filter((emp) =>
      emp.employee_name?.toLowerCase().includes(q) ||
      emp.username?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.phone?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-white">Employees</h1>
          <p className="text-sm text-slate-400 mt-0.5">{employees.length} total members</p>
        </div>
        <button
          onClick={openCreate}
          className="cursor-pointer shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <FaPlus className="text-xs" /> <span className="hidden sm:inline">Add Employee</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      <div className="mb-5">
        <input type="text" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} className={INPUT} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {filteredEmployees.length === 0 ? (
          <p className="text-slate-500 text-sm col-span-full text-center py-8">No employees found</p>
        ) : (
          filteredEmployees.map((emp) => (
            <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-colors">
              <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-semibold text-sm mb-2">
                {emp.employee_name?.charAt(0)?.toUpperCase() || "E"}
              </div>
              <h3 className="text-slate-200 text-sm font-semibold truncate">{emp.employee_name}</h3>
              <p className="text-slate-500 text-xs truncate mt-0.5">{emp.username}</p>
              <p className="text-slate-500 text-xs truncate">{emp.email}</p>
              <p className="text-slate-500 text-xs truncate">{emp.phone}</p>
              <p className="text-slate-500 text-xs truncate">{emp.department} · {emp.designation}</p>
              <p className="text-green-400 text-xs mt-1">₹{emp.salary}</p>
              <span className={`inline-block mt-1.5 px-2 py-0.5 text-[10px] rounded-md font-medium ${emp.is_active ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                {emp.is_active ? "Active" : "Inactive"}
              </span>
              <div className="flex justify-end gap-2 mt-2 pt-2 border-t border-slate-800">
                <button onClick={() => openEdit(emp)} className="cursor-pointer text-slate-400 hover:text-blue-400 text-sm transition-colors p-0.5" title="Edit"><FaEdit /></button>
                <button onClick={() => handleDelete(emp.id)} className="cursor-pointer text-slate-400 hover:text-red-400 text-sm transition-colors p-0.5" title="Delete"><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">{editId ? "Edit Employee" : "Add Employee"}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-slate-500 hover:text-white text-lg transition-colors">✕</button>
            </div>

            <div className="space-y-3">
              <input name="employee_name" placeholder="Employee Name *" value={form.employee_name} onChange={handleChange} className={INPUT} />
              <input name="username" placeholder="Username *" value={form.username} onChange={handleChange} className={INPUT} />
              <input name="email" placeholder="Email *" value={form.email} onChange={handleChange} className={INPUT} />
              <input name="phone" placeholder="Phone Number *" value={form.phone} onChange={handleChange} className={INPUT} />
              <input name="department" placeholder="Department *" value={form.department} onChange={handleChange} className={INPUT} />
              <select name="designation" value={form.designation} onChange={handleChange} className={SELECT}>
                <option value="Employee">Employee</option>
                <option value="Manager">Manager</option>
              </select>
              <input name="salary" type="number" placeholder="Salary *" value={form.salary} onChange={handleChange} className={INPUT} />
              <select name="is_active" value={form.is_active ? "true" : "false"} onChange={handleChange} className={SELECT}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <input name="password" type="password" placeholder={editId ? "New password (leave blank to keep)" : "Password *"} value={form.password} onChange={handleChange} className={INPUT} />
              <p className="text-xs text-slate-500">
                {editId ? "Leave password blank to keep current password." : "If blank, a temporary password will be generated."}
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="cursor-pointer flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="cursor-pointer flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

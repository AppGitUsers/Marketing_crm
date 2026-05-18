import { useState } from "react";
import { FaUserPlus } from "react-icons/fa";
import api from "../../api/axios";

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

const emptyForm = () => ({ username: "", email: "", phone: "", role: "employee", password: "", confirmPassword: "" });

export default function AdminRegister() {
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); setSuccess("");
  };

  const handleSubmit = async () => {
    const { username, email, phone, role, password, confirmPassword } = form;
    if (!username || !email || !role || !password) { setError("Username, email, role, and password are required."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }

    setSaving(true); setError(""); setSuccess("");
    try {
      await api.post("accounts/register/", { username: username.trim(), email: email.trim(), phone: phone.trim(), role, password });
      setSuccess(`${role === "admin" ? "Admin" : "Employee"} "${username}" registered successfully!`);
      setForm(emptyForm());
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data).flat().join(" ") || "Registration failed." : "Registration failed.");
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Register User</h1>
        <p className="text-sm text-slate-400 mt-0.5">Create a new employee or admin account</p>
      </div>

      <div className="w-full max-w-md">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <FaUserPlus />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">New Account</h2>
              <p className="text-xs text-slate-500">Fill in the details below</p>
            </div>
          </div>

          {success && (
            <div className="mb-4 px-3 py-2.5 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Role</label>
              <select name="role" value={form.role} onChange={handleChange} className={INPUT}>
                <option value="employee">Employee</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Username</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="Enter username" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Enter email" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone <span className="text-slate-600">(optional)</span></label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Min 6 characters" className={INPUT} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Confirm Password</label>
              <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Re-enter password" className={INPUT} />
            </div>

            {form.role === "employee" && (
              <div className="px-3 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg">
                <p className="text-xs text-slate-400">An Employee profile will be auto-created. Update their details from the Employees page.</p>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={saving}
              className="cursor-pointer w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
            >
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
              ) : "Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserPlus } from "react-icons/fa";
import api from "../../api/axios";

const emptyForm = () => ({
  username: "",
  email: "",
  phone: "",
  role: "employee",
  password: "",
  confirmPassword: "",
});

export default function AdminRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    const { username, email, phone, role, password, confirmPassword } = form;

    if (!username || !email || !role || !password) {
      setError("Username, email, role, and password are required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.post("accounts/register/", {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        password,
      });

      setSuccess(
        `${role === "admin" ? "Admin" : "Employee"} "${username}" registered successfully!`
      );
      setForm(emptyForm());
    } catch (err) {
      const data = err.response?.data;
      if (data) {
        const messages = Object.values(data).flat().join(" ");
        setError(messages || "Registration failed. Please try again.");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#000814] text-white p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/admin/dashboard")}
          className="cursor-pointer mb-6 flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-300 rounded-md hover:bg-cyan-400 hover:text-black transition shadow-[0_0_10px_#00f0ff]"
        >
          <FaArrowLeft /> Dashboard
        </button>

        <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_30px_#00f0ff]">
          <div className="bg-[#020617] rounded-xl p-8">
            <div className="flex items-center justify-center gap-3 mb-6">
              <FaUserPlus className="text-cyan-400 text-2xl" />
              <h2 className="text-2xl text-cyan-300 tracking-widest font-semibold">
                REGISTER USER
              </h2>
            </div>

            {success && (
              <div className="mb-4 px-4 py-3 bg-green-500/20 border border-green-400 rounded-md text-green-300 text-sm text-center">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 px-4 py-3 bg-red-500/20 border border-red-400 rounded-md text-red-300 text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-cyan-400 mb-1">Role</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-cyan-400 bg-[#020617] text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-1">Username</label>
                <input
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  className="w-full px-4 py-2 border border-cyan-400 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                  className="w-full px-4 py-2 border border-cyan-400 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-1">
                  Phone <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-cyan-400 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 6 characters"
                  className="w-full px-4 py-2 border border-cyan-400 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs text-cyan-400 mb-1">Confirm Password</label>
                <input
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full px-4 py-2 border border-cyan-400 bg-transparent text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {form.role === "employee" && (
                <p className="text-xs text-gray-400 bg-white/5 border border-cyan-400/20 rounded-md px-3 py-2">
                  An Employee profile will be auto-created after registration.
                  You can update their details from the Employees page.
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={saving}
                className="cursor-pointer w-full py-3 bg-cyan-400 text-black font-semibold rounded-md shadow-[0_0_15px_#00f0ff] hover:shadow-[0_0_25px_#00f0ff] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { FaPhoneAlt, FaUserFriends, FaCheckCircle, FaRedoAlt, FaHandshake, FaFolderOpen, FaBullseye } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const FOLLOW_UP_STATUSES = ["Follow Up", "Interested"];
const ALL_STATUSES = ["Interested", "Not Interested", "Follow Up", "Converted", "Did Not Pick"];

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

export default function EmployeeDashboard() {
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [target, setTarget] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", phone: "", project: "", status: "", notes: "", followUp: "" });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("calls/", {
        name: form.name, phone: form.phone, project: form.project,
        status: form.status, notes: form.notes,
        follow_up: FOLLOW_UP_STATUSES.includes(form.status) ? form.followUp || null : null,
      });
      await fetchCalls(); await fetchTarget();
      setShowModal(false);
      setForm({ name: "", phone: "", project: "", status: "", notes: "", followUp: "" });
    } catch (e) { console.log(e.response?.data); }
    finally { setSaving(false); }
  };

  useEffect(() => { fetchCalls(); fetchProjects(); fetchTarget(); }, []);

  const fetchCalls = async () => {
    try { const res = await api.get("calls/my-calls/"); setCalls(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const fetchProjects = async () => {
    try { const res = await api.get("projects/"); setProjects(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const fetchTarget = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await api.get(`targets/my/?date=${today}`);
      setTarget(res.data);
    } catch (e) { console.log(e.response?.data); }
  };

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayCalls = calls.filter((c) => c.created_at && c.created_at.slice(0, 10) === todayStr);
  const targetCount = target?.target_count ?? null;
  const callsDone = target?.calls_done ?? todayCalls.length;
  const targetMet = targetCount !== null && callsDone >= targetCount;
  const progressPct = targetCount ? Math.min(100, Math.round((callsDone / targetCount) * 100)) : 0;

  const cards = [
    { title: "Total Calls", value: calls.length, icon: <FaPhoneAlt />, route: "/employee/my-calls", color: "text-blue-400", bg: "bg-blue-500/10" },
    { title: "Leads", value: calls.filter((c) => c.status === "Interested").length, icon: <FaUserFriends />, route: "/employee/leads", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { title: "Conversions", value: calls.filter((c) => c.status === "Converted").length, icon: <FaCheckCircle />, route: "/employee/conversions", color: "text-green-400", bg: "bg-green-500/10" },
    { title: "Follow Ups", value: calls.filter((c) => c.status === "Follow Up").length, icon: <FaRedoAlt />, route: "/employee/follow-ups", color: "text-orange-400", bg: "bg-orange-500/10" },
    { title: "Closed Deals", value: calls.filter((c) => c.status === "Closed").length, icon: <FaHandshake />, route: "/employee/closed-deals", color: "text-slate-300", bg: "bg-slate-500/10" },
    { title: "Projects", value: projects.length, icon: <FaFolderOpen />, route: "/employee/projects", color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">Your call activity overview</p>
      </div>

      {/* TARGET PROGRESS */}
      {targetCount !== null ? (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FaBullseye className="text-blue-400" />
              <span className="text-sm font-semibold text-slate-200">Today's Target</span>
            </div>
            <span className={`text-sm font-bold ${targetMet ? "text-green-400" : "text-yellow-400"}`}>
              {callsDone} / {targetCount} calls{targetMet && " · Met"}
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${targetMet ? "bg-green-500" : "bg-blue-500"}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-1.5">{progressPct}% complete</p>
        </div>
      ) : (
        <div className="mb-6 bg-slate-900 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <FaBullseye className="text-slate-600" />
            No target assigned for today by admin.
          </p>
        </div>
      )}

      {/* DASHBOARD CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => navigate(card.route)}
            className="cursor-pointer bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors"
          >
            <div className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center ${card.color} text-sm mb-3`}>
              {card.icon}
            </div>
            <p className="text-slate-400 text-xs">{card.title}</p>
            <p className={`text-2xl font-bold mt-0.5 ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowModal(true)}
        className="cursor-pointer fixed bottom-6 right-6 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-lg transition-colors z-50"
      >
        + Add Call
      </button>

      {/* ADD CALL MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Add Call</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-slate-500 hover:text-white text-lg transition-colors">✕</button>
            </div>

            <div className="space-y-3">
              <input type="text" name="name" placeholder="Client Name" value={form.name} onChange={handleChange} className={INPUT} />
              <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={INPUT} />

              <select name="project" value={form.project} onChange={handleChange} className={INPUT}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>

              <select name="status" value={form.status} onChange={handleChange} className={INPUT}>
                <option value="">Select Status</option>
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>

              {FOLLOW_UP_STATUSES.includes(form.status) && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date</label>
                  <input type="date" name="followUp" value={form.followUp} onChange={handleChange} className={INPUT} />
                </div>
              )}

              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" rows={2} className={INPUT} />
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="cursor-pointer flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="cursor-pointer flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

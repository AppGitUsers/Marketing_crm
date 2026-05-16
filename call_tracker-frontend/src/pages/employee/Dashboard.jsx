import { useState, useEffect } from "react";
import { FaPhoneAlt, FaUserFriends, FaCheckCircle, FaRedoAlt, FaHandshake, FaFolderOpen, FaBullseye, FaCalendarCheck, FaEdit } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const FOLLOW_UP_STATUSES = ["Follow Up", "Interested"];
const ALL_STATUSES = ["Interested", "Not Interested", "Follow Up", "Converted", "Did Not Pick"];

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

const toDateTimeLocal = (val) => {
  if (!val) return "";
  if (val.length === 10) return val + "T00:00";
  return val.slice(0, 16);
};

const fmtTime = (val) => (val && val.length > 10 ? val.slice(11, 16) : "—");

export default function EmployeeDashboard() {
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [target, setTarget] = useState(null);
  const [doneTarget, setDoneTarget] = useState(null);
  const [rescheduleTarget, setRescheduleTarget] = useState(null); // { id, date, name }
  const [editFollowUp, setEditFollowUp] = useState(null); // call object being edited
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
  const todayFollowUps = calls.filter((c) => c.status === "Follow Up" && c.follow_up && c.follow_up.slice(0, 10) === todayStr);

  // Called when user picks a new date — shows confirm modal instead of window.confirm
  const handleRescheduleSelect = (call, newDate) => {
    if (!newDate) return;
    setRescheduleTarget({ id: call.id, date: newDate, name: call.name });
  };

  const confirmReschedule = async () => {
    if (!rescheduleTarget) return;
    const call = calls.find((c) => c.id === rescheduleTarget.id);
    if (!call) return;
    try {
      await api.put(`calls/${rescheduleTarget.id}/`, { name: call.name, phone: call.phone, project: call.project, status: call.status, notes: call.notes, follow_up: rescheduleTarget.date });
      await fetchCalls();
    } catch (e) { console.log(e.response?.data); }
    setRescheduleTarget(null);
  };

  const confirmMarkDone = async (newStatus) => {
    const call = calls.find((c) => c.id === doneTarget);
    if (!call) return;
    try {
      await api.put(`calls/${doneTarget}/`, { name: call.name, phone: call.phone, project: call.project, status: newStatus, notes: call.notes, follow_up: call.follow_up });
      await fetchCalls();
    } catch (e) { console.log(e.response?.data); }
    setDoneTarget(null);
  };

  const handleEditUpdate = async () => {
    if (!editFollowUp) return;
    try {
      await api.put(`calls/${editFollowUp.id}/`, { name: editFollowUp.name, phone: editFollowUp.phone, project: editFollowUp.project, status: editFollowUp.status, notes: editFollowUp.notes, follow_up: editFollowUp.follow_up });
      await fetchCalls();
      setEditFollowUp(null);
    } catch (e) { console.log(e.response?.data); }
  };

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

  const doneCall = doneTarget ? calls.find((c) => c.id === doneTarget) : null;

  return (
    <div className="pb-24">
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

      {/* TODAY'S FOLLOW-UPS */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4">
          <FaCalendarCheck className="text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Today's Follow-ups</h2>
          {todayFollowUps.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 font-medium">{todayFollowUps.length}</span>
          )}
        </div>

        {todayFollowUps.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
            <p className="text-slate-500 text-sm">No follow-ups scheduled for today</p>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                    <th className="px-4 py-2.5">Client</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-4 py-2.5">Scheduled Time</th>
                    <th className="px-4 py-2.5">Reschedule</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todayFollowUps.map((call) => (
                    <tr key={call.id} className="border-t border-slate-800 bg-yellow-500/5 hover:bg-yellow-500/10 transition-colors">
                      <td className="px-4 py-3 text-slate-100 font-medium">{call.name}</td>
                      <td className="px-4 py-3 text-slate-400">{call.phone}</td>
                      <td className="px-4 py-3 text-slate-400">{call.project || "—"}</td>
                      <td className="px-4 py-3 text-slate-300 text-xs whitespace-nowrap font-medium">
                        {fmtTime(call.follow_up)}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="datetime-local"
                          defaultValue=""
                          min={new Date().toISOString().slice(0, 16)}
                          onChange={(e) => handleRescheduleSelect(call, e.target.value)}
                          className="cursor-pointer bg-slate-950 border border-slate-700 text-slate-300 text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500"
                          title="Pick date & time to reschedule"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditFollowUp(call)}
                            className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1"
                            title="View / Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => setDoneTarget(call.id)}
                            className="cursor-pointer px-3 py-1 text-xs rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors font-medium"
                          >
                            Done ✓
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
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
                  <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date & Time</label>
                  <input type="datetime-local" name="followUp" value={form.followUp} onChange={handleChange} className={INPUT} />
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

      {/* RESCHEDULE CONFIRM MODAL */}
      {rescheduleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[360px] p-6">
            <h2 className="text-base font-semibold text-white mb-2">Confirm Reschedule</h2>
            <p className="text-sm text-slate-400 mb-6">
              Reschedule <span className="text-slate-200 font-medium">{rescheduleTarget.name}</span>'s follow-up to{" "}
              <span className="text-yellow-400 font-medium">{rescheduleTarget.date.replace("T", " at ")}</span>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRescheduleTarget(null)}
                className="cursor-pointer flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReschedule}
                className="cursor-pointer flex-1 py-2.5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Yes, Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MARK DONE — STATUS PICKER MODAL */}
      {doneCall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[360px] p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-white">Mark as Done</h2>
              <button onClick={() => setDoneTarget(null)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              What's the outcome for <span className="text-slate-200 font-medium">{doneCall.name}</span>?
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => confirmMarkDone("Interested")}
                className="cursor-pointer w-full py-2.5 rounded-lg bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors text-sm font-medium"
              >
                Interested
              </button>
              <button
                onClick={() => confirmMarkDone("Converted")}
                className="cursor-pointer w-full py-2.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors text-sm font-medium"
              >
                Converted
              </button>
              <button
                onClick={() => confirmMarkDone("Not Interested")}
                className="cursor-pointer w-full py-2.5 rounded-lg bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition-colors text-sm font-medium"
              >
                Not Interested
              </button>
            </div>
            <button onClick={() => setDoneTarget(null)} className="cursor-pointer w-full mt-3 py-2 text-slate-500 hover:text-slate-300 text-sm transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* EDIT FOLLOW-UP MODAL */}
      {editFollowUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Edit Follow-up</h2>
              <button onClick={() => setEditFollowUp(null)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={editFollowUp.name}
                onChange={(e) => setEditFollowUp({ ...editFollowUp, name: e.target.value })}
                placeholder="Client Name"
                className={INPUT}
              />
              <input
                type="text"
                value={editFollowUp.phone}
                onChange={(e) => setEditFollowUp({ ...editFollowUp, phone: e.target.value })}
                placeholder="Phone"
                className={INPUT}
              />
              <select
                value={editFollowUp.project || ""}
                onChange={(e) => setEditFollowUp({ ...editFollowUp, project: e.target.value })}
                className={INPUT}
              >
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <select
                value={editFollowUp.status}
                onChange={(e) => setEditFollowUp({ ...editFollowUp, status: e.target.value })}
                className={INPUT}
              >
                <option value="Follow Up">Follow Up</option>
                <option value="Converted">Converted</option>
                <option value="Interested">Interested</option>
                <option value="Closed">Closed</option>
                <option value="Not Interested">Not Interested</option>
              </select>
              <textarea
                value={editFollowUp.notes || ""}
                onChange={(e) => setEditFollowUp({ ...editFollowUp, notes: e.target.value })}
                placeholder="Notes"
                rows={4}
                className={INPUT}
              />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(editFollowUp.follow_up)}
                  onChange={(e) => setEditFollowUp({ ...editFollowUp, follow_up: e.target.value })}
                  className={INPUT}
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditFollowUp(null)} className="cursor-pointer flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleEditUpdate} className="cursor-pointer flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

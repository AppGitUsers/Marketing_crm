import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import api from "../../api/axios";

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

export default function FollowUps() {
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editData, setEditData] = useState(null);

  useEffect(() => { fetchCalls(); fetchProjects(); }, []);

  const fetchCalls = async () => {
    try { const res = await api.get("calls/my-calls/"); setCalls(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const fetchProjects = async () => {
    try { const res = await api.get("projects/"); setProjects(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const followUps = calls.filter((c) => c.status === "Follow Up");
  const today = new Date().toISOString().split("T")[0];

  const updateStatus = async (id, newStatus) => {
    const call = calls.find((c) => c.id === id);
    if (!call) return;
    try {
      await api.put(`calls/${id}/`, { name: call.name, phone: call.phone, project: call.project, status: newStatus, notes: call.notes, follow_up: call.follow_up });
      await fetchCalls();
    } catch (e) { console.log(e.response?.data); }
  };

  const updateFollowUpDate = async (id, newDate) => {
    const call = calls.find((c) => c.id === id);
    if (!call) return;
    try {
      await api.put(`calls/${id}/`, { name: call.name, phone: call.phone, project: call.project, status: call.status, notes: call.notes, follow_up: newDate });
      await fetchCalls();
    } catch (e) { console.log(e.response?.data); }
  };

  const handleUpdate = async () => {
    if (!editData) return;
    try {
      await api.put(`calls/${editData.id}/`, { name: editData.name, phone: editData.phone, project: editData.project, status: editData.status, notes: editData.notes, follow_up: editData.follow_up });
      await fetchCalls();
      setEditData(null);
    } catch (e) { console.log(e.response?.data); }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Follow-up Calls</h1>
        <p className="text-sm text-slate-400 mt-0.5">{followUps.length} pending follow-ups</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {followUps.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No follow-ups scheduled</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                  <th className="px-4 py-2.5">Client</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Next Follow-up</th>
                  <th className="px-4 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followUps.map((call) => {
                  const isToday = call.follow_up === today;
                  return (
                    <tr key={call.id} className={`border-t border-slate-800 transition-colors ${isToday ? "bg-yellow-500/5" : "hover:bg-slate-800/40"}`}>
                      <td className="px-4 py-3 text-slate-100">{call.name}</td>
                      <td className="px-4 py-3 text-slate-400">{call.phone}</td>
                      <td className="px-4 py-3 text-slate-400">{call.project || "—"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={call.status}
                          onChange={(e) => updateStatus(call.id, e.target.value)}
                          className="cursor-pointer bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                        >
                          <option value="Follow Up">Follow Up</option>
                          <option value="Converted">Converted</option>
                          <option value="Interested">Interested</option>
                          <option value="Closed">Closed</option>
                          <option value="Not Interested">Not Interested</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="date"
                          value={call.follow_up || ""}
                          onChange={(e) => updateFollowUpDate(call.id, e.target.value)}
                          className="cursor-pointer bg-slate-950 border border-slate-700 text-slate-300 text-xs px-2 py-1 rounded-lg focus:outline-none focus:border-blue-500"
                        />
                        {isToday && <span className="ml-2 text-xs text-yellow-400 font-medium">Today</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setEditData(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1">
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Edit Follow-up</h2>
              <button onClick={() => setEditData(null)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="Client Name" className={INPUT} />
              <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="Phone" className={INPUT} />
              <select value={editData.project || ""} onChange={(e) => setEditData({ ...editData, project: e.target.value })} className={INPUT}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className={INPUT}>
                <option value="Follow Up">Follow Up</option>
                <option value="Converted">Converted</option>
                <option value="Interested">Interested</option>
                <option value="Closed">Closed</option>
                <option value="Not Interested">Not Interested</option>
              </select>
              <textarea value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} placeholder="Notes" rows={3} className={INPUT} />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date</label>
                <input type="date" value={editData.follow_up || ""} onChange={(e) => setEditData({ ...editData, follow_up: e.target.value })} className={INPUT} />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setEditData(null)} className="cursor-pointer flex-1 py-2.5 border border-slate-700 text-slate-300 rounded-lg text-sm hover:bg-slate-800 transition-colors">Cancel</button>
              <button onClick={handleUpdate} className="cursor-pointer flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

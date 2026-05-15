import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function FollowUps() {
  const [calls, setCalls] = useState([]);

  useEffect(() => { fetchCalls(); }, []);

  const fetchCalls = async () => {
    try { const res = await api.get("calls/my-calls/"); setCalls(res.data); }
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
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

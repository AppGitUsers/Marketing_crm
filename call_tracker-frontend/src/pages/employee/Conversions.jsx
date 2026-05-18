import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import api from "../../api/axios";

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

export default function Conversions() {
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this conversion?")) return;
    try { await api.delete(`calls/${id}/`); await fetchCalls(); }
    catch (e) { console.log(e.response?.data); }
  };

  const updateStatus = async (id, newStatus) => {
    const call = calls.find((c) => c.id === id);
    if (!call) return;
    try {
      await api.put(`calls/${id}/`, { name: call.name, phone: call.phone, project: call.project, status: newStatus, notes: call.notes, follow_up: call.follow_up });
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

  const conversions = calls.filter((c) => c.status === "Converted");
  const filtered = conversions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Conversions</h1>
        <p className="text-sm text-slate-400 mt-0.5">{conversions.length} converted clients</p>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search conversions..." value={search} onChange={(e) => setSearch(e.target.value)} className={INPUT} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No conversions found</p>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="sm:hidden divide-y divide-slate-800">
              {filtered.map((call) => (
                <div key={call.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-100 font-medium text-sm truncate">{call.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{call.phone} · {call.project || "—"}</p>
                      {call.notes && <p className="text-slate-500 text-xs mt-1 line-clamp-2">{call.notes}</p>}
                    </div>
                    <div className="ml-2 shrink-0 flex flex-col items-end gap-1">
                      <select
                        value={call.status}
                        onChange={(e) => updateStatus(call.id, e.target.value)}
                        className="cursor-pointer bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => setEditData(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1.5"><FaEdit size={13} /></button>
                    <button onClick={() => handleDelete(call.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1.5"><FaTrash size={13} /></button>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                    <th className="px-4 py-2.5">Client</th>
                    <th className="px-4 py-2.5">Phone</th>
                    <th className="px-4 py-2.5">Project</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Notes</th>
                    <th className="px-4 py-2.5">Follow Up</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((call) => (
                    <tr key={call.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-100">{call.name}</td>
                      <td className="px-4 py-3 text-slate-400">{call.phone}</td>
                      <td className="px-4 py-3 text-slate-400">{call.project || "—"}</td>
                      <td className="px-4 py-3">
                        <select value={call.status} onChange={(e) => updateStatus(call.id, e.target.value)} className="cursor-pointer bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500">
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[150px]">{call.notes || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{call.follow_up || "—"}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button onClick={() => setEditData(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1"><FaEdit /></button>
                          <button onClick={() => handleDelete(call.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* EDIT MODAL */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Edit Conversion</h2>
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
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Interested">Interested</option>
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

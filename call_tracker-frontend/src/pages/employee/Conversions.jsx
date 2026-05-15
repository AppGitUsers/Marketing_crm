import { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import api from "../../api/axios";

export default function Conversions() {
  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchCalls(); }, []);

  const fetchCalls = async () => {
    try { const res = await api.get("calls/my-calls/"); setCalls(res.data); }
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

  const conversions = calls.filter((c) => c.status === "Converted");
  const filtered = conversions.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Conversions</h1>
        <p className="text-sm text-slate-400 mt-0.5">{conversions.length} converted clients</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search conversions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors"
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No conversions found</p>
        ) : (
          <div className="overflow-x-auto">
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
                      <select
                        value={call.status}
                        onChange={(e) => updateStatus(call.id, e.target.value)}
                        className="cursor-pointer bg-slate-950 border border-slate-700 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="Converted">Converted</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-slate-400 truncate max-w-[150px]">{call.notes || "—"}</td>
                    <td className="px-4 py-3 text-slate-400">{call.follow_up || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => handleDelete(call.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

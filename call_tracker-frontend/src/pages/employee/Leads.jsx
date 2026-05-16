import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../api/axios";

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

const toDateTimeLocal = (val) => {
  if (!val) return "";
  if (val.length === 10) return val + "T00:00";
  return val.slice(0, 16);
};

const fmtDate = (val) => (val ? val.slice(0, 10) : "—");
const fmtTime = (val) => (val && val.length > 10 ? val.slice(11, 16) : "—");

export default function Leads() {
  const [calls, setCalls] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);

  const [form, setForm] = useState({ name: "", phone: "", project: "", notes: "", follow_up: "" });

  useEffect(() => { fetchCalls(); fetchProjects(); }, []);

  const fetchCalls = async () => {
    try { const res = await api.get("calls/my-calls/"); setCalls(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const fetchProjects = async () => {
    try { const res = await api.get("projects/"); setProjects(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("calls/", { name: form.name, phone: form.phone, project: form.project, status: "Interested", notes: form.notes, follow_up: form.follow_up || null });
      await fetchCalls(); setShowModal(false);
      setForm({ name: "", phone: "", project: "", notes: "", follow_up: "" });
    } catch (e) { console.log(e.response?.data); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this lead?")) return;
    try { await api.delete(`calls/${id}/`); await fetchCalls(); }
    catch (e) { console.log(e.response?.data); }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`calls/${editData.id}/`, { name: editData.name, phone: editData.phone, project: editData.project, status: editData.status, notes: editData.notes, follow_up: editData.follow_up });
      await fetchCalls(); setEditData(null);
    } catch (e) { console.log(e.response?.data); }
  };

  const convertToFollowUp = async (id) => {
    const call = calls.find((c) => c.id === id);
    if (!call) return;
    try {
      await api.put(`calls/${id}/`, { name: call.name, phone: call.phone, project: call.project, status: "Follow Up", notes: call.notes, follow_up: call.follow_up || new Date().toISOString().split("T")[0] });
      await fetchCalls();
    } catch (e) { console.log(e.response?.data); }
  };

  const leads = calls.filter((c) => c.status === "Interested");
  const filteredLeads = leads.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Leads</h1>
          <p className="text-sm text-slate-400 mt-0.5">{leads.length} interested clients</p>
        </div>
      </div>

      <div className="mb-4">
        <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className={INPUT} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filteredLeads.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No leads found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                  <th className="px-4 py-2.5">Client</th>
                  <th className="px-4 py-2.5">Phone</th>
                  <th className="px-4 py-2.5">Project</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Follow-up Date</th>
                  <th className="px-4 py-2.5">Time</th>
                  <th className="px-4 py-2.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((call) => (
                  <tr key={call.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-100">{call.name}</td>
                    <td className="px-4 py-3 text-slate-400">{call.phone}</td>
                    <td className="px-4 py-3 text-slate-400">{call.project || "—"}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-md bg-blue-500/10 text-blue-400">Interested</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(call.follow_up)}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtTime(call.follow_up)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button onClick={() => setEditData(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1"><FaEdit /></button>
                        <button onClick={() => convertToFollowUp(call.id)} className="cursor-pointer text-xs px-2.5 py-1 border border-yellow-500/30 text-yellow-400 rounded-md hover:bg-yellow-500/10 transition-colors">Follow Up</button>
                        <button onClick={() => handleDelete(call.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1"><FaTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* FAB */}
      <button onClick={() => setShowModal(true)} className="cursor-pointer fixed bottom-6 right-6 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-lg transition-colors z-50 flex items-center gap-2">
        <FaPlus className="text-xs" /> Add Lead
      </button>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Add Lead</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <input type="text" name="name" placeholder="Client Name" value={form.name} onChange={handleChange} className={INPUT} />
              <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={INPUT} />
              <select name="project" value={form.project} onChange={handleChange} className={INPUT}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" rows={2} className={INPUT} />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date & Time (optional)</label>
                <input type="datetime-local" name="follow_up" value={form.follow_up} onChange={handleChange} className={INPUT} />
              </div>
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

      {/* EDIT MODAL */}
      {editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-xl w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Edit Lead</h2>
              <button onClick={() => setEditData(null)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
            </div>
            <div className="space-y-3">
              <input type="text" value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} placeholder="Client Name" className={INPUT} />
              <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="Phone" className={INPUT} />
              <select value={editData.project} onChange={(e) => setEditData({ ...editData, project: e.target.value })} className={INPUT}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
              </select>
              <select value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })} className={INPUT}>
                <option value="Interested">Interested</option>
                <option value="Not Interested">Not Interested</option>
                <option value="Follow Up">Follow Up</option>
                <option value="Converted">Converted</option>
              </select>
              <textarea value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} placeholder="Notes" rows={2} className={INPUT} />
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={toDateTimeLocal(editData.follow_up)}
                  onChange={(e) => setEditData({ ...editData, follow_up: e.target.value })}
                  className={INPUT}
                />
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

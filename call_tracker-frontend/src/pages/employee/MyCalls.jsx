import { useEffect, useState } from "react";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import api from "../../api/axios";

const FOLLOW_UP_STATUSES = ["Follow Up", "Interested"];
const ALL_STATUSES = ["Interested", "Not Interested", "Follow Up", "Converted", "Did Not Pick"];

const STATUS_COLOR = {
  Interested:      "bg-blue-500/10 text-blue-400",
  "Follow Up":     "bg-yellow-500/10 text-yellow-400",
  "Not Interested":"bg-red-500/10 text-red-400",
  Converted:       "bg-green-500/10 text-green-400",
  "Did Not Pick":  "bg-orange-500/10 text-orange-400",
};

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors";

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

export default function MyCalls() {
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [form, setForm] = useState({ name: "", phone: "", project: "", status: "", notes: "", follow_up: "" });

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
      await api.post("calls/", {
        name: form.name, phone: form.phone, project: form.project, status: form.status, notes: form.notes,
        follow_up: FOLLOW_UP_STATUSES.includes(form.status) ? form.follow_up || null : null,
      });
      await fetchCalls(); setShowModal(false);
      setForm({ name: "", phone: "", project: "", status: "", notes: "", follow_up: "" });
    } catch (e) { console.log(e.response?.data); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this call?")) return;
    try { await api.delete(`calls/${id}/`); await fetchCalls(); }
    catch (e) { console.log(e.response?.data); }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`calls/${editData.id}/`, {
        name: editData.name, phone: editData.phone, project: editData.project,
        status: editData.status, notes: editData.notes,
        follow_up: FOLLOW_UP_STATUSES.includes(editData.status) ? editData.follow_up || null : null,
      });
      await fetchCalls(); setEditData(null);
    } catch (e) { console.log(e.response?.data); }
  };

  const filteredCalls = calls.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search) ||
    c.project?.toLowerCase().includes(search.toLowerCase()) ||
    c.status.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(filteredCalls.length / itemsPerPage);

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">My Calls</h1>
        <p className="text-sm text-slate-400 mt-0.5">{calls.length} total calls recorded</p>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by client, phone, project, status..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          className={INPUT}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filteredCalls.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No calls found</p>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="sm:hidden divide-y divide-slate-800">
              {paginatedCalls.map((call) => (
                <div key={call.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-100 font-medium text-sm truncate">{call.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{call.phone}</p>
                    </div>
                    <span className={`ml-2 shrink-0 px-2 py-0.5 text-xs rounded-md ${STATUS_COLOR[call.status] || "bg-slate-500/10 text-slate-400"}`}>
                      {call.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-500 text-xs">{call.project || "—"} · {formatDateTime(call.created_at)}</p>
                    <div className="flex gap-3 ml-2">
                      <button onClick={() => setEditData(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1">
                        <FaEdit size={13} />
                      </button>
                      <button onClick={() => handleDelete(call.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1">
                        <FaTrash size={13} />
                      </button>
                    </div>
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
                    <th className="px-4 py-2.5">Follow Up</th>
                    <th className="px-4 py-2.5">Added At</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCalls.map((call) => (
                    <tr key={call.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-100">{call.name}</td>
                      <td className="px-4 py-3 text-slate-400">{call.phone}</td>
                      <td className="px-4 py-3 text-slate-400">{call.project || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-md ${STATUS_COLOR[call.status] || "bg-slate-500/10 text-slate-400"}`}>{call.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{call.follow_up || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(call.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-3">
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

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-4">
          <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} className="cursor-pointer px-3 py-1.5 border border-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors">Prev</button>
          <span className="text-slate-400 text-xs">Page {currentPage} of {totalPages}</span>
          <button onClick={() => setCurrentPage((p) => (p < totalPages ? p + 1 : p))} disabled={currentPage === totalPages} className="cursor-pointer px-3 py-1.5 border border-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors">Next</button>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setShowModal(true)} className="cursor-pointer fixed bottom-[72px] md:bottom-6 right-4 md:right-6 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-lg transition-colors z-40 flex items-center gap-2">
        <FaPlus className="text-xs" /> Add Call
      </button>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Add Call</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-slate-500 hover:text-white text-lg">✕</button>
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
                  <input type="date" name="follow_up" value={form.follow_up} onChange={handleChange} className={INPUT} />
                </div>
              )}
              <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" rows={2} className={INPUT} />
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">Edit Call</h2>
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
                {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {FOLLOW_UP_STATUSES.includes(editData.status) && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date</label>
                  <input type="date" value={editData.follow_up || ""} onChange={(e) => setEditData({ ...editData, follow_up: e.target.value })} className={INPUT} />
                </div>
              )}
              <textarea value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} placeholder="Notes" rows={2} className={INPUT} />
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

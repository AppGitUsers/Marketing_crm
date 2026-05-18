import { useEffect, useMemo, useState } from "react";
import { FaPlus, FaEdit, FaTrash, FaTimes, FaCalendarAlt, FaClock, FaStar } from "react-icons/fa";
import api from "../../api/axios";

const ALL_STATUSES = ["Interested", "Follow Up", "Converted", "Closed", "Not Interested", "Did Not Pick"];
const FOLLOW_UP_STATUSES = ["Follow Up", "Interested"];

const STATUS_COLOR = {
  Interested:      "bg-blue-500/10 text-blue-400",
  Converted:       "bg-green-500/10 text-green-400",
  Closed:          "bg-slate-500/10 text-slate-400",
  "Follow Up":     "bg-yellow-500/10 text-yellow-400",
  "Not Interested":"bg-red-500/10 text-red-400",
  "Did Not Pick":  "bg-orange-500/10 text-orange-400",
};

const INPUT = "w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors mb-3";

function formatDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

function timeAgo(iso) {
  if (!iso) return null;
  const mins = Math.floor((Date.now() - new Date(iso)) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

function avgIntervalMins(calls) {
  if (calls.length < 2) return null;
  const sorted = [...calls].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  let total = 0;
  for (let i = 1; i < sorted.length; i++)
    total += (new Date(sorted[i].created_at) - new Date(sorted[i - 1].created_at)) / 60000;
  return Math.round(total / (sorted.length - 1));
}

function callScore(calls) {
  if (!calls.length) return 0;
  const weighted =
    calls.filter((c) => c.status === "Interested").length * 1 +
    calls.filter((c) => c.status === "Follow Up").length * 0.5 +
    calls.filter((c) => c.status === "Converted").length * 3 +
    calls.filter((c) => c.status === "Closed").length * 5;
  return Math.round((weighted / (calls.length * 5)) * 10 * 10) / 10;
}

export default function Calls() {
  const [calls, setCalls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortType, setSortType] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", project: "", status: "Interested", follow_up: "", employee: "", notes: "" });

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchData = async () => {
    try {
      const [callsRes, empRes] = await Promise.all([api.get("admin/calls/"), api.get("admin/employees/")]);
      setCalls(callsRes.data);
      setEmployees(empRes.data);
    } catch (e) { console.log(e.response?.data || e); }
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async () => {
    if (!form.name || !form.phone) { alert("Fill required fields"); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name, phone: form.phone, project: form.project, status: form.status,
        follow_up: FOLLOW_UP_STATUSES.includes(form.status) ? form.follow_up || null : null,
        notes: form.notes, employee_id: form.employee || null,
      };
      if (editId) await api.put(`admin/calls/${editId}/`, payload);
      else await api.post("admin/calls/", payload);
      await fetchData(); setShowModal(false); setEditId(null); resetForm();
    } catch (e) { console.log(e.response?.data || e); alert("Save failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this call?")) return;
    try { await api.delete(`admin/calls/${id}/`); await fetchData(); } catch { alert("Delete failed"); }
  };

  const handleEdit = (call) => {
    setEditId(call.id);
    setForm({ name: call.name || "", phone: call.phone || "", project: call.project || "", status: call.status || "Interested", follow_up: call.follow_up || "", employee: call.employee_id ? String(call.employee_id) : "", notes: call.notes || "" });
    setShowModal(true);
  };

  const resetForm = () => setForm({ name: "", phone: "", project: "", status: "Interested", follow_up: "", employee: "", notes: "" });

  const getCallDate = (call) => call.created_at ? call.created_at.slice(0, 10) : "";

  const dateFilteredCalls = useMemo(() => {
    if (!selectedDate) return calls;
    return calls.filter((c) => getCallDate(c) === selectedDate);
  }, [calls, selectedDate]);

  const employeeCards = useMemo(() => employees.map((emp) => {
    const empCalls = dateFilteredCalls.filter((c) => c.employee_id === emp.id);
    const sorted = [...empCalls].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return {
      id: emp.id, employee_name: emp.employee_name,
      total: empCalls.length,
      interested: empCalls.filter((c) => c.status === "Interested").length,
      followUp: empCalls.filter((c) => c.status === "Follow Up").length,
      converted: empCalls.filter((c) => c.status === "Converted").length,
      closed: empCalls.filter((c) => c.status === "Closed").length,
      notInterested: empCalls.filter((c) => c.status === "Not Interested").length,
      didNotPick: empCalls.filter((c) => c.status === "Did Not Pick").length,
      lastCallAt: sorted[0]?.created_at || null,
      avgIntervalMins: avgIntervalMins(empCalls),
      score: callScore(empCalls),
    };
  }), [employees, dateFilteredCalls]);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    const result = dateFilteredCalls.filter((c) => {
      const matchSearch = c.name?.toLowerCase().includes(s) || c.phone?.includes(search) || c.project?.toLowerCase().includes(s) || c.employee_name?.toLowerCase().includes(s) || c.status?.toLowerCase().includes(s);
      const matchStatus = statusFilter === "All" || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
    if (sortType === "date") return [...result].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    if (sortType === "status") return [...result].sort((a, b) => (a.status || "").localeCompare(b.status || ""));
    return result;
  }, [dateFilteredCalls, search, statusFilter, sortType]);

  const scoreColor = (s) => s >= 7 ? "text-green-400" : s >= 4 ? "text-yellow-400" : "text-red-400";

  return (
    <div>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-white">Calls Summary</h1>
          <p className="text-sm text-slate-400 mt-0.5">Monitor employee call activity</p>
        </div>
        <button onClick={() => { setEditId(null); resetForm(); setShowModal(true); }} className="cursor-pointer shrink-0 flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
          <FaPlus className="text-xs" /> <span className="hidden sm:inline">Add Call</span><span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* DATE FILTER */}
      <div className="mb-5">
        <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
          <FaCalendarAlt className="text-blue-400" />
          <span>Filter by date</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="flex-1 min-w-0 px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          />
          {selectedDate && (
            <button onClick={() => setSelectedDate("")} className="cursor-pointer shrink-0 text-xs px-3 py-2 border border-slate-700 text-slate-400 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">Clear</button>
          )}
        </div>
        {selectedDate && <p className="text-xs text-slate-500 mt-1.5">Showing: {selectedDate}</p>}
      </div>

      {/* EMPLOYEE SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
        {employeeCards.map((emp) => (
          <div key={emp.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {emp.employee_name?.charAt(0)?.toUpperCase()}
                </div>
                <h3 className="text-slate-200 text-sm font-semibold truncate">{emp.employee_name}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                <FaStar className={`text-xs ${scoreColor(emp.score)}`} />
                <span className={`text-sm font-bold ${scoreColor(emp.score)}`}>{emp.total ? emp.score : "—"}/10</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-3">
              <p className="text-slate-400">Total: <span className="text-slate-200 font-medium">{emp.total}</span></p>
              <p className="text-slate-400">Interested: <span className="text-blue-400">{emp.interested}</span></p>
              <p className="text-slate-400">Follow Up: <span className="text-yellow-400">{emp.followUp}</span></p>
              <p className="text-slate-400">Converted: <span className="text-green-400">{emp.converted}</span></p>
              <p className="text-slate-400">Closed: <span className="text-slate-300">{emp.closed}</span></p>
              <p className="text-slate-400">Not Int.: <span className="text-red-400">{emp.notInterested}</span></p>
              <p className="text-slate-400">Did Not Pick: <span className="text-orange-400">{emp.didNotPick}</span></p>
            </div>

            <div className="border-t border-slate-800 pt-2 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <FaClock className="text-blue-400 shrink-0" />
                <span>Last call:</span>
                <span className="text-slate-300 ml-1 truncate">
                  {emp.lastCallAt ? `${formatDateTime(emp.lastCallAt)} (${timeAgo(emp.lastCallAt)})` : "No calls yet"}
                </span>
              </div>
              <p>Avg interval: <span className="text-slate-300">{emp.avgIntervalMins !== null ? `${emp.avgIntervalMins} min` : "—"}</span></p>
            </div>
          </div>
        ))}
      </div>

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <input
          type="text"
          placeholder="Search calls..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-[40%] px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 placeholder-slate-600 transition-colors"
        />
        <div className="flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="cursor-pointer flex-1 sm:flex-none px-3 py-2 bg-slate-950 border border-slate-700 text-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="All">All Status</option>
            {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={sortType} onChange={(e) => setSortType(e.target.value)} className="cursor-pointer flex-1 sm:flex-none px-3 py-2 bg-slate-950 border border-slate-700 text-slate-300 rounded-lg text-sm focus:outline-none focus:border-blue-500">
            <option value="">Sort</option>
            <option value="date">By Date</option>
            <option value="status">By Status</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No calls found</p>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="sm:hidden divide-y divide-slate-800">
              {filtered.map((call) => (
                <div key={call.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-100 font-medium text-sm truncate">{call.name}</p>
                      <p className="text-slate-400 text-xs mt-0.5">{call.phone} · {call.employee_name || "—"}</p>
                      {call.project && <p className="text-slate-500 text-xs">{call.project}</p>}
                    </div>
                    <span className={`ml-2 shrink-0 px-2 py-0.5 text-xs rounded-md ${STATUS_COLOR[call.status] || "bg-slate-500/10 text-slate-400"}`}>{call.status}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-slate-500 text-xs">{formatDateTime(call.created_at)}</p>
                    <div className="flex gap-3 ml-2">
                      <button onClick={() => handleEdit(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1"><FaEdit size={13} /></button>
                      <button onClick={() => handleDelete(call.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1"><FaTrash size={13} /></button>
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
                    <th className="px-4 py-2.5">Employee</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Follow Up</th>
                    <th className="px-4 py-2.5">Added At</th>
                    <th className="px-4 py-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((call) => (
                    <tr key={call.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-100 truncate max-w-[120px]">{call.name}</td>
                      <td className="px-4 py-3 text-slate-400">{call.phone}</td>
                      <td className="px-4 py-3 text-slate-400 truncate max-w-[100px]">{call.project || "—"}</td>
                      <td className="px-4 py-3 text-slate-400">{call.employee_name || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-xs rounded-md ${STATUS_COLOR[call.status] || "bg-slate-500/10 text-slate-400"}`}>{call.status}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{call.follow_up || "—"}</td>
                      <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDateTime(call.created_at)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center items-center gap-3">
                          <button onClick={() => handleEdit(call)} className="cursor-pointer text-slate-400 hover:text-blue-400 transition-colors p-1"><FaEdit /></button>
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-xl shadow-xl w-full sm:max-w-[440px] max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-white">{editId ? "Edit Call" : "Add Call"}</h2>
              <button onClick={() => setShowModal(false)} className="cursor-pointer text-slate-500 hover:text-white text-lg"><FaTimes /></button>
            </div>

            <input name="name" placeholder="Client Name *" value={form.name} onChange={handleChange} className={INPUT} />
            <input name="phone" placeholder="Phone *" value={form.phone} onChange={handleChange} className={INPUT} />
            <input name="project" placeholder="Project" value={form.project} onChange={handleChange} className={INPUT} />

            <select name="employee" value={form.employee} onChange={handleChange} className={INPUT}>
              <option value="">Assign Employee</option>
              {employees.map((emp) => <option key={emp.id} value={emp.id}>{emp.employee_name}</option>)}
            </select>

            <select name="status" value={form.status} onChange={handleChange} className={INPUT}>
              {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {FOLLOW_UP_STATUSES.includes(form.status) && (
              <div className="mb-3">
                <label className="block text-xs text-slate-400 mb-1.5">Follow-up Date</label>
                <input type="date" name="follow_up" value={form.follow_up} onChange={handleChange} className="w-full px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500" />
              </div>
            )}

            <textarea name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} className={INPUT} rows={3} />

            <button onClick={handleSave} disabled={saving} className="cursor-pointer w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 mt-1">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

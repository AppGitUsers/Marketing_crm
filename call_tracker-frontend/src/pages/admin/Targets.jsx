import { useEffect, useState } from "react";
import { FaBullseye, FaEdit, FaTrash, FaCalendarAlt, FaSave } from "react-icons/fa";
import api from "../../api/axios";

function todayStr() { return new Date().toISOString().slice(0, 10); }

export default function Targets() {
  const [trackDate, setTrackDate] = useState(todayStr());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => { fetchTargets(); }, [trackDate]);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`targets/admin/?date=${trackDate}`);
      setData(res.data);
    } catch (e) { console.log(e.response?.data || e); }
    finally { setLoading(false); }
  };

  const startEdit = (emp) => setEditing((p) => ({ ...p, [emp.employee_id]: emp.target_count !== null ? String(emp.target_count) : "" }));
  const cancelEdit = (id) => setEditing((p) => { const n = { ...p }; delete n[id]; return n; });

  const saveTarget = async (emp) => {
    const val = editing[emp.employee_id];
    if (!val || isNaN(val) || Number(val) < 1) { alert("Enter a valid target (minimum 1)."); return; }
    setSaving((p) => ({ ...p, [emp.employee_id]: true }));
    try {
      await api.post("targets/admin/set/", { employee: emp.employee_id, target_count: Number(val) });
      cancelEdit(emp.employee_id);
      await fetchTargets();
    } catch { alert("Failed to save target."); }
    finally { setSaving((p) => ({ ...p, [emp.employee_id]: false })); }
  };

  const removeTarget = async (emp) => {
    if (!emp.target_id) return;
    if (!window.confirm(`Remove daily target for ${emp.employee_name}?`)) return;
    try { await api.delete("targets/admin/set/", { data: { target_id: emp.target_id } }); await fetchTargets(); }
    catch { alert("Failed to remove target."); }
  };

  const pct = (done, target) => (!target ? 0 : Math.min(100, Math.round((done / target) * 100)));

  const barClass = (p) => {
    if (p >= 100) return "bg-green-500";
    if (p >= 60) return "bg-yellow-500";
    return "bg-blue-500";
  };

  const badge = (done, target) => {
    if (target === null) return <span className="text-xs text-slate-500 italic">No target</span>;
    const p = pct(done, target);
    if (p >= 100) return <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 rounded-md font-medium">Target Met</span>;
    if (p >= 60) return <span className="text-xs px-2 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-md">In Progress</span>;
    return <span className="text-xs px-2 py-0.5 bg-red-500/10 text-red-400 rounded-md">Behind</span>;
  };

  const withTargets = data.filter((e) => e.target_count !== null);
  const metToday = withTargets.filter((e) => e.calls_done >= e.target_count);
  const totalCallsToday = data.reduce((s, e) => s + e.calls_done, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Daily Targets</h1>
        <p className="text-sm text-slate-400 mt-0.5">Set and track employee call targets</p>
      </div>

      <div className="mb-5 bg-blue-500/5 border border-blue-500/20 rounded-xl px-4 py-3 text-sm text-slate-400">
        Set a <span className="text-blue-400 font-medium">daily call target</span> for each employee — once set, it applies every day. Use the date picker to track progress for any date.
      </div>

      {/* DATE PICKER */}
      <div className="mb-6 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <FaCalendarAlt className="text-blue-400" />
          <span>Track date:</span>
        </div>
        <input
          type="date"
          value={trackDate}
          onChange={(e) => setTrackDate(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
        />
        <button onClick={() => setTrackDate(todayStr())} className="cursor-pointer text-xs px-3 py-2 border border-slate-700 text-slate-300 rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors">
          Today
        </button>
      </div>

      {/* SUMMARY */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Targets Assigned", value: `${withTargets.length} / ${data.length}`, color: "text-blue-400" },
            { label: `Calls on ${trackDate === todayStr() ? "Today" : trackDate}`, value: totalCallsToday, color: "text-slate-200" },
            { label: "Targets Met", value: metToday.length, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* EMPLOYEE ROWS */}
      {loading ? (
        <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : data.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-12">No active employees found.</p>
      ) : (
        <div className="space-y-3">
          {data.map((emp) => {
            const p = pct(emp.calls_done, emp.target_count);
            const isEditing = emp.employee_id in editing;
            const isSaving = saving[emp.employee_id];

            return (
              <div key={emp.employee_id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center text-xs font-bold">
                          {emp.employee_name?.charAt(0)?.toUpperCase()}
                        </div>
                        <h3 className="text-slate-200 text-sm font-semibold">{emp.employee_name}</h3>
                      </div>
                      {badge(emp.calls_done, emp.target_count)}
                    </div>
                    <div className="flex items-center gap-4 text-xs flex-wrap text-slate-400">
                      <span>Calls today: <span className="text-slate-200 font-medium">{emp.calls_done}</span></span>
                      {emp.target_count !== null && !isEditing && (
                        <span>Daily target: <span className="text-blue-400 font-medium">{emp.target_count}</span></span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          min="1"
                          value={editing[emp.employee_id]}
                          onChange={(e) => setEditing((p) => ({ ...p, [emp.employee_id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === "Enter") saveTarget(emp); if (e.key === "Escape") cancelEdit(emp.employee_id); }}
                          placeholder="Calls / day"
                          autoFocus
                          className="w-28 px-3 py-1.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                        />
                        <button onClick={() => saveTarget(emp)} disabled={isSaving} className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg disabled:opacity-50 transition-colors">
                          <FaSave className="text-[10px]" />
                          {isSaving ? "..." : "Save"}
                        </button>
                        <button onClick={() => cancelEdit(emp.employee_id)} className="cursor-pointer px-3 py-1.5 border border-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-800 transition-colors">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => startEdit(emp)} className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-800 hover:border-slate-600 transition-colors">
                          <FaEdit className="text-[10px]" />
                          {emp.target_count !== null ? "Edit" : "Set Target"}
                        </button>
                        {emp.target_count !== null && (
                          <button onClick={() => removeTarget(emp)} className="cursor-pointer p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {emp.target_count !== null && (
                  <div className="mt-3">
                    <div className="w-full bg-slate-800 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all duration-500 ${barClass(p)}`} style={{ width: `${p}%` }} />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{emp.calls_done} of {emp.target_count} calls — {p}% complete</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import { FaBullseye, FaEdit, FaTrash, FaCalendarAlt, FaSave } from "react-icons/fa";
import api from "../../api/axios";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function Targets() {
  const [trackDate, setTrackDate] = useState(todayStr());
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // inline editing state: { [employee_id]: inputValue }
  const [editing, setEditing] = useState({});
  const [saving, setSaving] = useState({});

  useEffect(() => {
    fetchTargets();
  }, [trackDate]);

  const fetchTargets = async () => {
    setLoading(true);
    try {
      const res = await api.get(`targets/admin/?date=${trackDate}`);
      setData(res.data);
    } catch (err) {
      console.log(err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (emp) => {
    setEditing((prev) => ({
      ...prev,
      [emp.employee_id]: emp.target_count !== null ? String(emp.target_count) : "",
    }));
  };

  const cancelEdit = (empId) => {
    setEditing((prev) => {
      const next = { ...prev };
      delete next[empId];
      return next;
    });
  };

  const saveTarget = async (emp) => {
    const val = editing[emp.employee_id];
    if (!val || isNaN(val) || Number(val) < 1) {
      alert("Enter a valid target (minimum 1).");
      return;
    }
    setSaving((prev) => ({ ...prev, [emp.employee_id]: true }));
    try {
      await api.post("targets/admin/set/", {
        employee: emp.employee_id,
        target_count: Number(val),
      });
      cancelEdit(emp.employee_id);
      await fetchTargets();
    } catch (err) {
      alert("Failed to save target.");
    } finally {
      setSaving((prev) => ({ ...prev, [emp.employee_id]: false }));
    }
  };

  const removeTarget = async (emp) => {
    if (!emp.target_id) return;
    if (!window.confirm(`Remove daily target for ${emp.employee_name}?`)) return;
    try {
      await api.delete("targets/admin/set/", { data: { target_id: emp.target_id } });
      await fetchTargets();
    } catch (err) {
      alert("Failed to remove target.");
    }
  };

  const pct = (done, target) => {
    if (!target) return 0;
    return Math.min(100, Math.round((done / target) * 100));
  };

  const barClass = (p) => {
    if (p >= 100) return "bg-green-400 shadow-[0_0_8px_#4ade80]";
    if (p >= 60) return "bg-yellow-400 shadow-[0_0_6px_#facc15]";
    return "bg-cyan-400 shadow-[0_0_6px_#00f0ff]";
  };

  const badge = (done, target) => {
    if (target === null) return <span className="text-xs text-gray-500 italic">No target</span>;
    const p = pct(done, target);
    if (p >= 100) return <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full font-medium">Target Met ✓</span>;
    if (p >= 60) return <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full">In Progress</span>;
    return <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">Behind</span>;
  };

  const withTargets = data.filter((e) => e.target_count !== null);
  const metToday = withTargets.filter((e) => e.calls_done >= e.target_count);
  const totalCallsToday = data.reduce((s, e) => s + e.calls_done, 0);

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-6">
        <FaBullseye className="text-cyan-400 text-xl" />
        <h2 className="text-xl text-cyan-300">Daily Targets</h2>
      </div>

      {/* INFO BANNER */}
      <div className="mb-5 bg-cyan-400/10 border border-cyan-400/30 rounded-xl px-4 py-3 text-sm text-cyan-300">
        Set a <strong>daily call target</strong> for each employee — once set it applies every day. Use the date picker below to track progress for any day.
      </div>

      {/* DATE PICKER FOR TRACKING */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-cyan-300 text-sm shrink-0">
          <FaCalendarAlt />
          <span>Track date:</span>
        </div>
        <input
          type="date"
          value={trackDate}
          onChange={(e) => setTrackDate(e.target.value)}
          className="px-4 py-2 bg-[#020617] border border-cyan-400 text-white rounded shadow-[0_0_8px_#00f0ff] focus:outline-none cursor-pointer"
        />
        <button
          onClick={() => setTrackDate(todayStr())}
          className="cursor-pointer text-xs px-3 py-2 border border-cyan-400 text-cyan-300 rounded hover:bg-cyan-400 hover:text-black transition"
        >
          Today
        </button>
      </div>

      {/* SUMMARY CARDS */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 border border-cyan-400/30 rounded-xl p-4 text-center shadow-[0_0_8px_#00f0ff]">
            <p className="text-gray-400 text-xs mb-1">Targets Assigned</p>
            <p className="text-2xl text-cyan-300 font-bold">{withTargets.length}<span className="text-gray-500 text-base"> / {data.length}</span></p>
          </div>
          <div className="bg-white/10 border border-cyan-400/30 rounded-xl p-4 text-center shadow-[0_0_8px_#00f0ff]">
            <p className="text-gray-400 text-xs mb-1">Calls on {trackDate === todayStr() ? "Today" : trackDate}</p>
            <p className="text-2xl text-cyan-300 font-bold">{totalCallsToday}</p>
          </div>
          <div className="bg-white/10 border border-cyan-400/30 rounded-xl p-4 text-center shadow-[0_0_8px_#00f0ff]">
            <p className="text-gray-400 text-xs mb-1">Targets Met</p>
            <p className="text-2xl text-green-400 font-bold">{metToday.length}</p>
          </div>
        </div>
      )}

      {/* EMPLOYEE ROWS */}
      {loading ? (
        <p className="text-gray-400 text-center py-12">Loading...</p>
      ) : data.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No active employees found.</p>
      ) : (
        <div className="space-y-3">
          {data.map((emp) => {
            const p = pct(emp.calls_done, emp.target_count);
            const isEditing = emp.employee_id in editing;
            const isSaving = saving[emp.employee_id];

            return (
              <div
                key={emp.employee_id}
                className="bg-white/10 border border-cyan-400/20 rounded-xl p-4 shadow-[0_0_8px_#00f0ff]"
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  {/* LEFT: name + stats */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-1">
                      <h3 className="text-cyan-300 font-semibold">{emp.employee_name}</h3>
                      {badge(emp.calls_done, emp.target_count)}
                    </div>
                    <div className="flex items-center gap-4 text-sm flex-wrap">
                      <span className="text-gray-400">
                        Calls today:{" "}
                        <span className="text-white font-medium">{emp.calls_done}</span>
                      </span>
                      {emp.target_count !== null && !isEditing && (
                        <span className="text-gray-400">
                          Daily target:{" "}
                          <span className="text-cyan-300 font-medium">{emp.target_count}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: edit controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          min="1"
                          value={editing[emp.employee_id]}
                          onChange={(e) =>
                            setEditing((prev) => ({
                              ...prev,
                              [emp.employee_id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveTarget(emp);
                            if (e.key === "Escape") cancelEdit(emp.employee_id);
                          }}
                          placeholder="Calls / day"
                          autoFocus
                          className="w-28 px-3 py-1.5 bg-transparent border border-cyan-400 text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        />
                        <button
                          onClick={() => saveTarget(emp)}
                          disabled={isSaving}
                          className="cursor-pointer flex items-center gap-1 px-3 py-1.5 bg-cyan-400 text-black text-sm rounded-md font-semibold disabled:opacity-50"
                        >
                          <FaSave className="text-xs" />
                          {isSaving ? "..." : "Save"}
                        </button>
                        <button
                          onClick={() => cancelEdit(emp.employee_id)}
                          className="cursor-pointer px-3 py-1.5 border border-gray-500 text-gray-300 text-sm rounded-md hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(emp)}
                          className="cursor-pointer flex items-center gap-1 px-3 py-1.5 border border-cyan-400 text-cyan-300 text-sm rounded-md hover:bg-cyan-400 hover:text-black transition"
                          title={emp.target_count !== null ? "Edit target" : "Set target"}
                        >
                          <FaEdit className="text-xs" />
                          {emp.target_count !== null ? "Edit" : "Set Target"}
                        </button>
                        {emp.target_count !== null && (
                          <button
                            onClick={() => removeTarget(emp)}
                            className="cursor-pointer p-2 text-red-400 hover:text-white hover:bg-red-500/20 rounded-md transition"
                            title="Remove target"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* PROGRESS BAR */}
                {emp.target_count !== null && (
                  <div className="mt-3">
                    <div className="w-full bg-white/10 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all duration-500 ${barClass(p)}`}
                        style={{ width: `${p}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {emp.calls_done} of {emp.target_count} calls — {p}% complete
                    </p>
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

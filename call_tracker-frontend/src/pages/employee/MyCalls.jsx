import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaArrowLeft } from "react-icons/fa";
import api from "../../api/axios";

const FOLLOW_UP_STATUSES = ["Follow Up", "Interested"];

const ALL_STATUSES = [
  "Interested",
  "Not Interested",
  "Follow Up",
  "Converted",
  "Did Not Pick",
];

function formatDateTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function MyCalls() {
  const navigate = useNavigate();

  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const [editData, setEditData] = useState(null);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    project: "",
    status: "",
    notes: "",
    follow_up: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCalls();
    fetchProjects();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await api.get("calls/my-calls/");
      setCalls(response.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const fetchProjects = async () => {
    try {
      const res = await api.get("projects/");
      setProjects(res.data);
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post("calls/", {
        name: form.name,
        phone: form.phone,
        project: form.project,
        status: form.status,
        notes: form.notes,
        follow_up: FOLLOW_UP_STATUSES.includes(form.status) ? form.follow_up || null : null,
      });
      await fetchCalls();
      setShowModal(false);
      setForm({ name: "", phone: "", project: "", status: "", notes: "", follow_up: "" });
    } catch (error) {
      console.log(error.response?.data);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`calls/${id}/`);
      await fetchCalls();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(`calls/${editData.id}/`, {
        name: editData.name,
        phone: editData.phone,
        project: editData.project,
        status: editData.status,
        notes: editData.notes,
        follow_up: FOLLOW_UP_STATUSES.includes(editData.status) ? editData.follow_up || null : null,
      });
      await fetchCalls();
      setEditData(null);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Interested":   return "bg-green-500/20 text-green-400";
      case "Follow Up":    return "bg-yellow-500/20 text-yellow-400";
      case "Not Interested": return "bg-red-500/20 text-red-400";
      case "Converted":    return "bg-blue-500/20 text-blue-400";
      case "Did Not Pick": return "bg-orange-500/20 text-orange-400";
      default:             return "bg-gray-500/20 text-gray-300";
    }
  };

  const filteredCalls = calls.filter(
    (call) =>
      call.name.toLowerCase().includes(search.toLowerCase()) ||
      call.phone.includes(search) ||
      call.project.toLowerCase().includes(search.toLowerCase()) ||
      call.status.toLowerCase().includes(search.toLowerCase())
  );

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCalls = filteredCalls.slice(startIndex, startIndex + itemsPerPage);

  const fieldClass =
    "w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400";
  const selectClass =
    "w-full px-4 py-2 bg-[#020617] border border-cyan-400 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400";

  return (
    <div>
      {/* BACK */}
      <button
        onClick={() => navigate("/employee/dashboard")}
        className="cursor-pointer mb-4 flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-300 rounded-md hover:bg-cyan-400 hover:text-black"
      >
        <FaArrowLeft /> Back
      </button>

      <h2 className="text-xl text-cyan-300 mb-4">My Calls</h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search calls, Projects, Clients, Mobile No..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
      />

      {/* TABLE */}
      <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 overflow-x-auto">
        {filteredCalls.length === 0 ? (
          <p className="text-gray-400 text-center py-6">No calls found</p>
        ) : (
          <table className="w-full text-white text-sm">
            <thead className="border-b border-cyan-400/30 text-cyan-300">
              <tr className="text-left">
                <th className="py-2 px-2">Client</th>
                <th className="px-2">Phone</th>
                <th className="px-2">Project</th>
                <th className="px-2">Status</th>
                <th className="px-2">Follow Up</th>
                <th className="px-2">Added At</th>
                <th className="px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCalls.map((call) => (
                <tr key={call.id} className="border-b border-gray-700 hover:bg-white/5">
                  <td className="py-2 px-2">{call.name}</td>
                  <td className="px-2">{call.phone}</td>
                  <td className="px-2">{call.project}</td>
                  <td className="px-2">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusStyle(call.status)}`}>
                      {call.status}
                    </span>
                  </td>
                  <td className="px-2">{call.follow_up || "-"}</td>
                  <td className="px-2 text-gray-400 text-xs whitespace-nowrap">
                    {formatDateTime(call.created_at)}
                  </td>
                  <td className="px-2 text-center">
                    <div className="flex justify-center items-center gap-4">
                      <button
                        onClick={() => setEditData(call)}
                        className="cursor-pointer text-cyan-400 hover:text-white hover:scale-110 transition"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(call.id)}
                        className="cursor-pointer text-red-400 hover:text-white hover:scale-110 transition"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center mt-4 gap-2">
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          className="cursor-pointer px-3 py-1 border border-cyan-400 text-cyan-300"
        >
          Prev
        </button>
        <span className="text-cyan-300">Page {currentPage}</span>
        <button
          onClick={() =>
            setCurrentPage((p) =>
              startIndex + itemsPerPage < filteredCalls.length ? p + 1 : p
            )
          }
          className="cursor-pointer px-3 py-1 border border-cyan-400 text-cyan-300"
        >
          Next
        </button>
      </div>

      {/* ADD BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="cursor-pointer fixed bottom-6 right-6 px-6 py-3 bg-cyan-400 text-black rounded-full shadow-[0_0_15px_#00f0ff]"
      >
        + Add Call
      </button>

      {/* ADD MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_25px_#00f0ff]">
            <div className="bg-[#020617] w-[500px] p-6 rounded-xl relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-3 right-3 text-cyan-400 hover:text-white text-xl"
              >
                ✕
              </button>
              <h2 className="text-2xl text-center text-cyan-300 mb-5 tracking-widest">ADD CALL</h2>
              <div className="space-y-3">
                <input type="text" name="name" placeholder="Client Name" value={form.name} onChange={handleChange} className={fieldClass} />
                <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className={fieldClass} />

                <select name="project" value={form.project} onChange={handleChange} className={selectClass}>
                  <option value="" className="bg-black">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name} className="bg-black">{p.name}</option>
                  ))}
                </select>

                <select name="status" value={form.status} onChange={handleChange} className={selectClass}>
                  <option value="" className="bg-black">Select Status</option>
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-black">{s}</option>
                  ))}
                </select>

                {FOLLOW_UP_STATUSES.includes(form.status) && (
                  <div>
                    <label className="block text-xs text-cyan-400 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      name="follow_up"
                      value={form.follow_up}
                      onChange={handleChange}
                      className={fieldClass}
                    />
                  </div>
                )}

                <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" rows="2" className={fieldClass} />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-cyan-400 text-black font-semibold rounded-md shadow-[0_0_10px_#00f0ff] disabled:opacity-50">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">
          <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_25px_#00f0ff]">
            <div className="bg-[#020617] w-[500px] p-6 rounded-xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setEditData(null)} className="cursor-pointer absolute top-3 right-3 text-cyan-400 hover:text-white text-xl">✕</button>
              <h2 className="text-2xl text-center text-cyan-300 mb-5 tracking-widest">EDIT CALL</h2>
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  placeholder="Client Name"
                  className={fieldClass}
                />
                <input
                  type="text"
                  value={editData.phone}
                  onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                  placeholder="Phone"
                  className={fieldClass}
                />

                <select
                  value={editData.project}
                  onChange={(e) => setEditData({ ...editData, project: e.target.value })}
                  className={selectClass}
                >
                  <option value="" className="bg-black">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name} className="bg-black">{p.name}</option>
                  ))}
                </select>

                <select
                  value={editData.status}
                  onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                  className={selectClass}
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s} className="bg-black">{s}</option>
                  ))}
                </select>

                {FOLLOW_UP_STATUSES.includes(editData.status) && (
                  <div>
                    <label className="block text-xs text-cyan-400 mb-1">Follow-up Date</label>
                    <input
                      type="date"
                      value={editData.follow_up || ""}
                      onChange={(e) => setEditData({ ...editData, follow_up: e.target.value })}
                      className={fieldClass}
                    />
                  </div>
                )}

                <textarea
                  value={editData.notes || ""}
                  onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  placeholder="Notes"
                  rows="2"
                  className={fieldClass}
                />
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button onClick={() => setEditData(null)} className="cursor-pointer px-4 py-2 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700">Cancel</button>
                <button onClick={handleUpdate} className="cursor-pointer px-4 py-2 bg-cyan-400 text-black font-semibold rounded-md shadow-[0_0_10px_#00f0ff]">Update</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

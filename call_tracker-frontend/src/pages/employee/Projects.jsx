import { useEffect, useState } from "react";
import { FaTrash, FaFolderOpen, FaPlus } from "react-icons/fa";
import api from "../../api/axios";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try { const res = await api.get("projects/"); setProjects(res.data); }
    catch (e) { console.log(e.response?.data); }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) { setError("Project name cannot be empty."); return; }
    setSaving(true); setError("");
    try {
      await api.post("projects/", { name }); setNewName(""); await fetchProjects();
    } catch (err) {
      const data = err.response?.data;
      setError(data?.name?.[0] || "Failed to add project.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try { await api.delete(`projects/${id}/`); await fetchProjects(); }
    catch (err) { alert(err.response?.data?.detail || "Failed to delete project."); }
  };

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-white">Projects</h1>
        <p className="text-sm text-slate-400 mt-0.5">{projects.length} projects available</p>
      </div>

      {/* ADD PROJECT */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <FaFolderOpen className="text-blue-400 text-sm" />
          <h2 className="text-sm font-semibold text-slate-300">Add New Project</h2>
        </div>
        <div className="flex gap-2 flex-col sm:flex-row">
          <input
            type="text"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Project name..."
            className="flex-1 px-3 py-2.5 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 placeholder-slate-600 transition-colors"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><FaPlus className="text-xs" /> Add</>}
          </button>
        </div>
        {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
      </div>

      {/* PROJECTS LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {projects.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-8">No projects yet. Add one above.</p>
        ) : (
          <>
            {/* MOBILE CARD VIEW */}
            <div className="sm:hidden divide-y divide-slate-800">
              {projects.map((project, idx) => (
                <div key={project.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 text-xs">{idx + 1}.</span>
                      <p className="text-slate-100 font-medium text-sm truncate">{project.name}</p>
                    </div>
                    <p className="text-slate-500 text-xs mt-0.5">{project.created_by_username} · {new Date(project.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(project.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1.5 ml-2 shrink-0">
                    <FaTrash size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-slate-500 uppercase tracking-wider bg-slate-800/50">
                    <th className="px-4 py-2.5">#</th>
                    <th className="px-4 py-2.5">Project Name</th>
                    <th className="px-4 py-2.5">Added By</th>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project, idx) => (
                    <tr key={project.id} className="border-t border-slate-800 hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                      <td className="px-4 py-3 text-slate-100 font-medium">{project.name}</td>
                      <td className="px-4 py-3 text-slate-400">{project.created_by_username}</td>
                      <td className="px-4 py-3 text-slate-400">{new Date(project.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => handleDelete(project.id)} className="cursor-pointer text-slate-400 hover:text-red-400 transition-colors p-1">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

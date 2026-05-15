import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash, FaFolderOpen } from "react-icons/fa";
import api from "../../api/axios";

export default function Projects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("projects/");
      setProjects(res.data);
    } catch (err) {
      console.log(err.response?.data);
    }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) {
      setError("Project name cannot be empty.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await api.post("projects/", { name });
      setNewName("");
      await fetchProjects();
    } catch (err) {
      const data = err.response?.data;
      if (data?.name) {
        setError(data.name[0]);
      } else {
        setError("Failed to add project.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.delete(`projects/${id}/`);
      await fetchProjects();
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete project.");
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/employee/dashboard")}
        className="cursor-pointer mb-4 flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-300 rounded-md hover:bg-cyan-400 hover:text-black transition"
      >
        <FaArrowLeft /> Back
      </button>

      <div className="flex items-center gap-2 mb-6">
        <FaFolderOpen className="text-cyan-400 text-xl" />
        <h2 className="text-xl text-cyan-300 tracking-wide">Projects</h2>
      </div>

      {/* Add Project */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff] p-5 mb-6">
        <h3 className="text-cyan-300 text-sm font-semibold mb-3">Add New Project</h3>

        <div className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => {
              setNewName(e.target.value);
              setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Project name..."
            className="flex-1 px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
          <button
            onClick={handleAdd}
            disabled={saving}
            className="cursor-pointer px-5 py-2 bg-cyan-400 text-black font-semibold rounded-md shadow-[0_0_10px_#00f0ff] hover:shadow-[0_0_20px_#00f0ff] transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              "+ Add"
            )}
          </button>
        </div>

        {error && (
          <p className="text-red-400 text-xs mt-2">{error}</p>
        )}
      </div>

      {/* Projects List */}
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff] p-5">
        {projects.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No projects yet. Add one above!
          </p>
        ) : (
          <table className="w-full text-white text-sm">
            <thead className="border-b border-cyan-400/30 text-cyan-300">
              <tr className="text-left">
                <th className="py-2 px-2">#</th>
                <th className="px-2">Project Name</th>
                <th className="px-2">Added By</th>
                <th className="px-2">Date</th>
                <th className="px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project, idx) => (
                <tr key={project.id} className="border-b border-gray-700 hover:bg-white/5">
                  <td className="py-2 px-2 text-gray-400">{idx + 1}</td>
                  <td className="px-2 text-cyan-200 font-medium">{project.name}</td>
                  <td className="px-2 text-gray-400">{project.created_by_username}</td>
                  <td className="px-2 text-gray-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-2 text-center">
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="cursor-pointer text-red-400 hover:text-white hover:scale-110 transition"
                      title="Delete"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

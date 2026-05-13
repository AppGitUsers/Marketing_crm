import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaArrowLeft } from "react-icons/fa";
import api from "../../api/axios";

export default function Conversions() {
  const navigate = useNavigate();

  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState("");

  // LOAD DATA
  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const response = await api.get("calls/my-calls/");
      setCalls(response.data);
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // DELETE
  const handleDelete = async (id) => {
    try {
      await api.delete(`calls/${id}/`);
      await fetchCalls();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // UPDATE STATUS
  const updateStatus = async (id, newStatus) => {
    const call = calls.find((c) => c.id === id);

    if (!call) return;

    try {
      await api.put(`calls/${id}/`, {
        name: call.name,
        phone: call.phone,
        project: call.project,
        status: newStatus,
        notes: call.notes,
        follow_up: call.follow_up,
      });

      await fetchCalls();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  // FILTER ONLY CONVERTED
  const conversions = calls.filter(
    (c) => c.status === "Converted"
  );

  // SEARCH
  const filtered = conversions.filter(
    (call) =>
      call.name.toLowerCase().includes(search.toLowerCase()) ||
      call.phone.includes(search)
  );

  return (
    <div>
      {/* BACK */}
      <button
        onClick={() => navigate("/employee/dashboard")}
        className="cursor-pointer mb-4 flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-300 rounded-md hover:bg-cyan-400 hover:text-black"
      >
        <FaArrowLeft /> Back
      </button>

      <h2 className="text-xl text-cyan-300 mb-4">
        Conversions (Closed Deals)
      </h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search conversions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
      />

      {/* TABLE */}
      <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 overflow-x-auto">

        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No conversions found
          </p>
        ) : (
          <table className="w-full text-white text-sm table-auto">

            {/* HEADER */}
            <thead className="border-b border-cyan-400/30 text-cyan-300">
              <tr className="text-left">
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4">Follow Up</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filtered.map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-gray-700 hover:bg-white/5 transition"
                >

                  <td className="px-4 py-3 align-middle">
                    {call.name}
                  </td>

                  <td className="px-4 align-middle">
                    {call.phone}
                  </td>

                  <td className="px-4 align-middle">
                    {call.project || "-"}
                  </td>

                  {/* STATUS */}
                  <td className="px-4 align-middle">
                    <select
                      value={call.status}
                      onChange={(e) =>
                        updateStatus(call.id, e.target.value)
                      }
                      className="cursor-pointer bg-transparent border border-cyan-400 text-cyan-300 rounded px-2 py-1 text-xs"
                    >
                      <option className="bg-black" value="Converted">
                        Converted
                      </option>

                      <option className="bg-black" value="Closed">
                        Closed
                      </option>
                    </select>
                  </td>

                  <td className="px-4 align-middle">
                    {call.notes || "-"}
                  </td>

                  <td className="px-4 align-middle">
                    {call.follow_up || "-"}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-4">

                      <button
                        onClick={() => handleDelete(call.id)}
                        className="cursor-pointer text-red-400 hover:text-white hover:scale-110 transition"
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
    </div>
  );
}
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaTrash } from "react-icons/fa";
import api from "../../api/axios";

export default function ClosedDeals() {
  const navigate = useNavigate();

  const [calls, setCalls] = useState([]);
  const [search, setSearch] = useState("");

  // LOAD
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

  // FILTER CLOSED
  const closedDeals = calls.filter((c) => c.status === "Closed");

  // SEARCH
  const filtered = closedDeals.filter(
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
        Closed Deals
      </h2>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search closed deals..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
      />

      {/* TABLE */}
      <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No closed deals
          </p>
        ) : (
          <table className="w-full text-white text-sm table-fixed border-collapse">
            {/* HEADER */}
            <thead className="border-b border-cyan-400/30 text-cyan-300">
              <tr className="text-left">
                <th className="py-3 px-4 w-[18%]">Client</th>
                <th className="py-3 px-4 w-[15%]">Phone</th>
                <th className="py-3 px-4 w-[15%]">Project</th>
                <th className="py-3 px-4 w-[12%]">Status</th>
                <th className="py-3 px-4 w-[20%]">Notes</th>
                <th className="py-3 px-4 w-[8%] text-center">Actions</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {filtered.map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-gray-700 hover:bg-white/5 transition"
                >
                  <td className="px-4 py-3 align-middle truncate">
                    {call.name}
                  </td>

                  <td className="px-4 align-middle">
                    {call.phone}
                  </td>

                  <td className="px-4 align-middle truncate">
                    {call.project || "-"}
                  </td>

                  <td className="px-4 align-middle">
                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">
                      Closed
                    </span>
                  </td>

                  <td className="px-4 align-middle truncate">
                    {call.notes || "-"}
                  </td>

                  <td className="px-4 align-middle text-center">
                    <div className="flex justify-center items-center gap-3">
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
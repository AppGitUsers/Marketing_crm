import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../../api/axios";

export default function FollowUps() {
  const [calls, setCalls] = useState([]);
  const navigate = useNavigate();

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

  // FILTER ONLY FOLLOW UPS
  const followUps = calls.filter((c) => c.status === "Follow Up");

  const today = new Date().toISOString().split("T")[0];

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

  const updateFollowUpDate = async (id, newDate) => {
    const call = calls.find((c) => c.id === id);
    if (!call) return;

    try {
      await api.put(`calls/${id}/`, {
        name: call.name,
        phone: call.phone,
        project: call.project,
        status: call.status,
        notes: call.notes,
        follow_up: newDate,
      });

      await fetchCalls();
    } catch (error) {
      console.log(error.response?.data);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate("/employee/dashboard")}
        className="cursor-pointer mb-4 flex items-center gap-2 px-4 py-2 border border-cyan-400 text-cyan-300 rounded-md hover:bg-cyan-400 hover:text-black"
      >
        <FaArrowLeft /> Back
      </button>

      <h2 className="text-xl text-cyan-300 mb-6">
        Follow-Up Calls
      </h2>

      <div className="bg-white/10 p-4 rounded-xl border border-cyan-400/30 overflow-x-auto">
        {followUps.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No follow-ups
          </p>
        ) : (
          <table className="w-full text-white text-sm">
            <thead className="border-b border-cyan-400/30 text-cyan-300">
              <tr className="text-left">
                <th className="py-2">Client</th>
                <th>Phone</th>
                <th>Project</th>
                <th>Status</th>
                <th>Next Follow Up</th>
              </tr>
            </thead>

            <tbody>
              {followUps.map((call) => {
                const isToday = call.follow_up === today;

                return (
                  <tr
                    key={call.id}
                    className={`border-b border-gray-700 ${
                      isToday ? "bg-yellow-500/10" : ""
                    }`}
                  >
                    <td className="py-2">{call.name}</td>
                    <td>{call.phone}</td>
                    <td>{call.project || "-"}</td>

                    <td className="px-2">
                      <select
                        value={call.status}
                        onChange={(e) =>
                          updateStatus(call.id, e.target.value)
                        }
                        className="cursor-pointer bg-transparent border border-cyan-400 text-cyan-300 rounded px-2 py-1 text-xs"
                      >
                        <option className="bg-black" value="Follow Up">
                          Follow Up
                        </option>
                        <option className="bg-black" value="Converted">
                          Converted
                        </option>
                        <option className="bg-black" value="Interested">
                          Interested
                        </option>
                        <option className="bg-black" value="Closed">
                          Closed
                        </option>
                        <option className="bg-black" value="Not Interested">
                          Not Interested
                        </option>
                      </select>
                    </td>

                    <td>
                      <input
                        type="date"
                        value={call.follow_up || ""}
                        onChange={(e) =>
                          updateFollowUpDate(call.id, e.target.value)
                        }
                        className="cursor-pointer bg-transparent border border-cyan-400 text-cyan-300 text-xs px-2 py-1"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
import { useState,useEffect } from "react";
import { FaPhoneAlt, FaUserFriends, FaCheckCircle, FaRedoAlt, FaHandshake, FaChartLine, FaFolderOpen } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function EmployeeDashboard() {
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [calls, setCalls] = useState([]);
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    project: "",
    status: "",
    notes: "",
    followUp: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {

    setSaving(true);

    try {

      await api.post(
        "calls/",
        {
          name: form.name,
          phone: form.phone,
          project: form.project,
          status: form.status,
          notes: form.notes,
          follow_up: form.followUp,
        }
      );

      await fetchCalls();

      setShowModal(false);

      setForm({
        name: "",
        phone: "",
        project: "",
        status: "",
        notes: "",
        followUp: "",
      });

    } catch (error) {

      console.log(error.response?.data);

    } finally {

      setSaving(false);
    }
  };
  useEffect(() => {
    fetchCalls();
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("accounts/me/");
        setProfile(response.data);
      } catch (error) {
        console.log(error.response?.data);
      }
    };
    fetchProfile();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("projects/");
      setProjects(res.data);
    } catch (err) {
      console.log(err.response?.data);
    }
  };;

  const fetchCalls = async () => {

    try {

      const response = await api.get(
        "calls/my-calls/"
      );

      setCalls(response.data);

    } catch (error) {

      console.log(error.response?.data);
    }
  };

  return (
    <div>
        <div className="flex items-center gap-2 mb-6">

          <FaChartLine className="text-cyan-400 text-xl drop-shadow-[0_0_5px_#00f0ff]" />

          <h2 className="text-xl text-cyan-300 tracking-wide">
            Your Activity
          </h2>

        </div>

      {/* DASHBOARD CARDS */}
      <div className="cursor-pointer grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
      {[
        {
          title: "Total Calls",
          value: calls.length,
          icon: <FaPhoneAlt />,
          route: "/employee/my-calls",
        },
        {
          title: "Leads",
          value: calls.filter(c => c.status === "Interested").length,
          icon: <FaUserFriends />,
          route: "/employee/leads",
        },
        {
          title: "Conversions",
          value: calls.filter(c => c.status === "Converted").length,
          icon: <FaCheckCircle />,
          route: "/employee/conversions",
        },
        {
          title: "Follow Ups",
          value: calls.filter(c => c.status === "Follow Up").length,
          icon: <FaRedoAlt />,
          route: "/employee/follow-ups",
        },
        {
          title: "Closed Deals",
          value: calls.filter(c => c.status === "Closed").length,
          icon: <FaHandshake />,
          route: "/employee/closed-deals",
        },
        {
          title: "Projects",
          value: projects.length,
          icon: <FaFolderOpen />,
          route: "/employee/projects",
        },
      ].map((card, index) => (
        <div
          key={index}
          onClick={() => card.route && navigate(card.route)}
          className={`h-[160px] flex flex-col justify-between bg-white/10 p-4 rounded-xl border border-cyan-400/30 shadow-[0_0_10px_#00f0ff] hover:shadow-[0_0_20px_#00f0ff] transition
${card.route ? "cursor-pointer hover:scale-105" : ""}`}
        >

          {/* 🔥 ICON */}
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-cyan-400/20 text-cyan-300 text-lg">
            {card.icon}
          </div>

          {/* TITLE */}
          <h3 className="text-sm text-gray-300">{card.title}</h3>

          {/* VALUE */}
          <p className="text-2xl text-cyan-300 font-semibold">
            {card.value}
          </p>

        </div>
      ))}
      </div>

      {/* FLOATING BUTTON */}
      <button
        onClick={() => setShowModal(true)}
        className="cursor-pointer fixed bottom-6 right-6 px-6 py-3 rounded-full bg-cyan-400 text-black font-semibold shadow-[0_0_15px_#00f0ff] hover:scale-110 transition z-50"
      >
        + Add Call
      </button>

      {/* 🔥 CYBER MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/80 z-50">

          {/* OUTER GLOW */}
          <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_25px_#00f0ff]">

            {/* INNER BOX */}
            <div className="bg-[#020617] w-[500px] p-6 rounded-xl relative">

              {/* TOP LINE */}
              <div className="absolute top-0 left-6 right-6 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />

              {/* BOTTOM LINE */}
              <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-cyan-400 shadow-[0_0_10px_#00f0ff]" />

              {/* CLOSE */}
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer absolute top-3 right-3 text-cyan-400 hover:text-white text-xl"
              >
                ✕
              </button>

              {/* TITLE */}
              <h2 className="text-2xl text-center text-cyan-300 mb-5 tracking-widest">
                ADD CALL
              </h2>

              {/* FORM */}
              <div className="space-y-3">

                <input
                  type="text"
                  name="name"
                  placeholder="Client Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
                />

                <input
                  type="text"
                  name="phone"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
                />

                <select
                  name="project"
                  value={form.project}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-[#020617] border border-cyan-400 rounded-md text-white"
                >
                  <option value="" className="bg-black">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.name} className="bg-black">
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
                >
                  <option className="bg-black">Select Status</option>
                  <option className="bg-black">Interested</option>
                  <option className="bg-black">Not Interested</option>
                  <option className="bg-black">Follow Up</option>
                  <option className="bg-black">Converted</option>
                </select>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Notes"
                  rows="2"
                  className="w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
                />

                <input
                  type="date"
                  name="followUp"
                  value={form.followUp}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-transparent border border-cyan-400 rounded-md text-white"
                />

              </div>

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 mt-5">
                <button
                  onClick={() => setShowModal(false)}
                  className="cursor-pointer px-4 py-2 border border-gray-500 text-gray-300 rounded-md hover:bg-gray-700"
                >
                  Cancel
                </button>
{/* 
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-cyan-400 text-black font-semibold rounded-md shadow-[0_0_10px_#00f0ff]"
                >
                  Save
                </button> */}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="cursor-pointer px-4 py-2 bg-cyan-400 text-black font-semibold rounded-md shadow-[0_0_10px_#00f0ff] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { fetchUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      alert("Enter credentials");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("accounts/login/", form);

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);

      localStorage.setItem(
        "user",
        JSON.stringify({
          username: response.data.username,
          role: response.data.role,
        })
      );

      localStorage.setItem("role", response.data.role);

      await fetchUser();

      if (response.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/dashboard");
      }
    } catch (error) {
      console.log(error.response?.data);
      alert("Invalid Username or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-[420px] p-8 border border-cyan-400 rounded-xl text-cyan-300 shadow-[0_0_25px_#00f0ff]"
    >
      <div className="absolute inset-0 rounded-xl border border-cyan-400 opacity-30 blur-sm pointer-events-none"></div>

      <h2 className="text-center text-3xl mb-8 tracking-widest">LOGIN</h2>

      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        className="w-full mb-4 px-4 py-3 bg-transparent border border-cyan-400 rounded-md placeholder-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        className="w-full mb-6 px-4 py-3 bg-transparent border border-cyan-400 rounded-md placeholder-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      />

      <button
        type="submit"
        disabled={loading}
        className="cursor-pointer w-full py-3 border border-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition shadow-[0_0_15px_#00f0ff] flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            Accessing...
          </>
        ) : (
          "ACCESS SYSTEM"
        )}
      </button>

      <p className="text-center text-sm mt-6 text-cyan-400">
        Don't have an account?{" "}
        <Link to="/register" className="underline hover:text-white">
          Register
        </Link>
      </p>
    </form>
  );
}
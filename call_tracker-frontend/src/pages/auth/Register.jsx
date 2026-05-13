import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/axios";

export default function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "employee",
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

    if (
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.role ||
      !form.password
    ) {
      alert("Fill all fields");
      return;
    }

    try {

      const response = await api.post(
        "accounts/register/",
        form
      );

      console.log(response.data);

      alert("Registration Successful");

      navigate("/");

    } catch (error) {

      console.log(error.response?.data);

      alert("Registration Failed");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-[420px] p-8 border border-cyan-400 rounded-xl text-cyan-300 shadow-[0_0_25px_#00f0ff]"
    >

      <div className="absolute inset-0 rounded-xl border border-cyan-400 opacity-30 blur-sm pointer-events-none"></div>

      <h2 className="text-center text-3xl mb-8 tracking-widest">
        REGISTER
      </h2>

      <input
        type="text"
        name="username"
        placeholder="Username"
        onChange={handleChange}
        className="w-full mb-4 px-4 py-3 bg-transparent border border-cyan-400 rounded-md placeholder-cyan-500"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        onChange={handleChange}
        className="w-full mb-4 px-4 py-3 bg-transparent border border-cyan-400 rounded-md placeholder-cyan-500"
      />

      <input
        type="text"
        name="phone"
        placeholder="Phone Number"
        onChange={handleChange}
        className="w-full mb-4 px-4 py-3 bg-transparent border border-cyan-400 rounded-md placeholder-cyan-500"
      />

      <select
        name="role"
        onChange={handleChange}
        className="w-full mb-4 px-4 py-3 bg-black border border-cyan-400 rounded-md text-cyan-300"
      >
        <option value="employee">
          Employee
        </option>

        <option value="admin">
          Admin
        </option>
      </select>

      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
        className="w-full mb-6 px-4 py-3 bg-transparent border border-cyan-400 rounded-md placeholder-cyan-500"
      />

      <button
        type="submit"
        className="w-full py-3 border border-cyan-400 rounded-md hover:bg-cyan-400 hover:text-black transition shadow-[0_0_15px_#00f0ff]"
      >
        CREATE ACCOUNT
      </button>

      <p className="text-center text-sm mt-6 text-cyan-400">
        Already have an account?{" "}
        <Link to="/" className="underline hover:text-white">
          Login
        </Link>
      </p>

    </form>
  );
} 
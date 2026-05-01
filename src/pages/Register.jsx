import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const API_URL = "https://mexicatradingbackend.onrender.com";
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        form
      );

      if (res.data.token) {
        sessionStorage.setItem("token", res.data.token);
        navigate("/login", { state: { email: form.email } });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-[#0a0f1c] text-white overflow-hidden px-4">

      {/* glow background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] bg-emerald-500/20 blur-[120px] rounded-full top-[-120px] left-[-120px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 blur-[120px] rounded-full bottom-[-120px] right-[-120px]" />
      </div>

      {/* form */}
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl hover:scale-[1.01] transition"
      >
        <h2 className="text-3xl font-bold text-center mb-2">
          Create Account 🚀
        </h2>

        <p className="text-center text-gray-400 mb-6">
          Join Mexicatrading and start investing
        </p>

        {error && (
          <p className="text-red-400 text-center mb-4 bg-red-500/10 border border-red-500/20 p-2 rounded-lg">
            {error}
          </p>
        )}

        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Full Name"
          required
          className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-emerald-400"
        />

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          required
          className="w-full p-3 mb-4 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-emerald-400"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="w-full p-3 mb-6 rounded-lg bg-white/10 border border-white/10 outline-none focus:border-emerald-400"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 transition font-semibold shadow-lg active:scale-95"
        >
          {loading ? "Creating account..." : "Register"}
        </button>

        <p className="text-center text-sm mt-5 text-gray-400">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-emerald-400 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

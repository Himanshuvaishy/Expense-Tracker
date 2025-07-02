import { useState } from "react";

import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AutoContext";
import nodeAPI from "../axios/nodeAPI";

const RegisterPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrMsg("");
    setSuccessMsg("");

    try {
      // ✅ Step 1: Clear any stale local/session data
      localStorage.clear();
      sessionStorage.clear();

      // ✅ Step 2: Register new user
      const res = await nodeAPI.post("/auth/register", {
        name,
        email,
        password,
      });

      // ✅ Step 3: Save user globally
      setUser(res.data.user || { name, email });

      // ✅ Step 4: Clear report cache
      Object.keys(localStorage)
        .filter((key) => key.startsWith("report_saved_"))
        .forEach((key) => localStorage.removeItem(key));

      setSuccessMsg("✅ Registration successful!");

      // ✅ Step 5: Redirect
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Register</h2>

        {errMsg && <p className="text-red-500 text-sm text-center">{errMsg}</p>}
        {successMsg && (
          <p className="text-green-600 text-sm text-center">{successMsg}</p>
        )}

        <input
          type="text"
          className="w-full p-2 border rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="email"
          className="w-full p-2 border rounded"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="w-full p-2 border rounded"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;

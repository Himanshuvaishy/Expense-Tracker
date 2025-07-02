import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AutoContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrMsg("");

    try {
      // ✅ Clear previous data before login
      localStorage.clear();
      sessionStorage.clear();

      const res = await axios.post(
        "http://localhost:7777/api/auth/login",
        { email, password },
        { withCredentials: true }
      );

      // ✅ Set the current user in context
      setUser(res.data.user);

      // ✅ Optional: clear report-related local storage keys
      Object.keys(localStorage)
        .filter((key) => key.startsWith("report_saved_"))
        .forEach((key) => localStorage.removeItem(key));

      navigate("/");
    } catch (err) {
      setErrMsg(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-6 rounded shadow w-96 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login</h2>

        {errMsg && (
          <p className="text-red-500 text-sm text-center">{errMsg}</p>
        )}

        <p className="text-sm text-center text-gray-600">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>

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
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;

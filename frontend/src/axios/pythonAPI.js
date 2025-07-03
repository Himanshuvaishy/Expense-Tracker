// src/axios/pythonAPI.js
import axios from "axios";

const pythonAPI = axios.create({
  baseURL: import.meta.env.VITE_PYTHON_API_URL, // ✅ Use env variable instead of hardcoded URL
  withCredentials: true,
});

export default pythonAPI;

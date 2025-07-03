// src/axios/nodeAPI.js
import axios from "axios";

const nodeAPI = axios.create({
  baseURL: import.meta.env.VITE_NODE_API_URL, // ✅ Use env variable instead of hardcoded URL
  withCredentials: true,
});

export default nodeAPI;

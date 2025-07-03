import axios from "axios";

const nodeAPI = axios.create({
  baseURL: "https://expense-tracker-1yf7.onrender.com", // ✅ Your Node.js backend
  withCredentials: true,
});

export default nodeAPI;

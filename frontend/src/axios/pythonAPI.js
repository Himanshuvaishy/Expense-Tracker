import axios from "axios";

const pythonAPI = axios.create({
  baseURL: "https://expense-tracker-1-03il.onrender.com", // ✅ Your Flask backend
  withCredentials: true,
});

export default pythonAPI;

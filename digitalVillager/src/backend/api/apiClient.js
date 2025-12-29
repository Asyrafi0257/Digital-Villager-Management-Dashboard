import axios from "axios";

// ✅ Point this to your backend server, not your React src folder
const api = axios.create({
  baseURL: "http://localhost/digital-villager-dashboard/backend/api/",
  withCredentials: true, // ✅ important for sessions

  headers: { "Content-Type": "application/json" },
});

export default api;
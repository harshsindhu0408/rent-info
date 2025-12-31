import axios from "axios";

// Create helper to check for auth
const api = axios.create({
  baseURL: "http://localhost:8000", // Backend URL
  withCredentials: true, // Important for cookies/session
});

export default api;

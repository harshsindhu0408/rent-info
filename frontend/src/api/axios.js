import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Important for cookies/session
});

// Response interceptor to handle 401/403 errors globally
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle authentication errors
    if (error.response) {
      const status = error.response.status;

      // Redirect to login on 401 (Unauthorized) or 403 (Forbidden)
      if (status === 401 || status === 403) {
        // Clear any stored user data
        localStorage.removeItem("user");

        // Only redirect if not already on login page
        if (window.location.pathname !== "/login") {
          // Use window.location for full page redirect to clear state
          window.location.href = "/login";
        }
      }
    }

    // Reject the promise so individual catch blocks still work
    return Promise.reject(error);
  }
);

// Export both the api instance and the base URL for use elsewhere
export { API_BASE_URL };
export default api;

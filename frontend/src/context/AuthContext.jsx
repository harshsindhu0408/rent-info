import { createContext, useState, useEffect, useContext } from "react";
import api, { API_BASE_URL } from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize user from local storage token if available (optimistic)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Ideally verify token with backend, but for now just load user if stored
      // Or rely on checkUserLoggedIn to fetch fresh profile
      checkUserLoggedIn();
    } else {
      setLoading(false);
    }
  }, []);

  const checkUserLoggedIn = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      // api interceptor will attach token
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data);
        return { success: true };
      }
      return { success: false, message: "No token received" };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const res = await api.post("/auth/register", userData);
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data);
        return { success: true };
      }
      return { success: false, message: "No token received" };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      // Optional: Tell backend to invalidate if needed, but primarily client-side
      // await api.post("/auth/logout");
      localStorage.removeItem("token");
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("token");
      setUser(null);
    }
  };

  // Function to clear user state (can be called from interceptor)
  const clearUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loading, clearUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useEffect, useContext } from "react";
import api, { API_BASE_URL } from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data);
    } catch (error) {
      // If 401/403, the interceptor handles redirect
      // Just clear user state for other errors
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    // Use the exported API_BASE_URL from axios config
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
      setUser(null);
      // Redirect to login after logout
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user and redirect on error
      setUser(null);
      window.location.href = '/login';
    }
  };

  // Function to clear user state (can be called from interceptor)
  const clearUser = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, clearUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

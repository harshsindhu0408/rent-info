import { createContext, useState, useEffect, useContext } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserLoggedIn();
  }, []);

  const checkUserLoggedIn = async () => {
    try {
      // We need a route to check session status.
      // Since the backend doesn't explicit have /auth/me, we can try to fetch a private route or add one.
      // OR we can rely on the fact that if we get 401 on protected routes, we trigger login.
      // Ideally, we should add a /auth/me endpoint.
      // For now, let's assume valid session if we can hit a protected endpoint or mock it.
      // Wait, I should add /auth/me to backend or simple hack:
      // Create a pseudo check.
      // Let's assume the user is logged in if they have a cookie.
      // But we need user details (name, role).
      // Let's implement a quick fetch from a protected route or add /auth/me to backend later if needed.
      // I'll assume we can use a simple GET request to a user endpoint if available.
      // Wait, I didn't add /auth/me. I should add it.

      // Temporary Plan: Try to get cars. If 401, not logged in.
      // But that's public.
      // I will add a backend endpoint /auth/me via the frontend by editing backend? No, I should stick to provided backend.
      // I can't easily edit backend now without switching context too much.
      // Wait, I can just use the provided passport session.
      // The prompt says "GET /auth/google".
      // I'll try to add a fetch to a known protected route.
      // Actually, I can use a hack: modify backend slightly or just assume if I can't fetch rentals I'm not admin.

      // Better approach: I will add `update backend` tasks if I must.
      // But let's check standard passport pattern. Usually you need an endpoint to return req.user.
      // I WILL ADD /auth/me to backend. It is necessary for specific "Role" based UI.

      const res = await api.get("/auth/me"); // I will implement this in backend shortly.
      setUser(res.data);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = () => {
    window.location.href = "http://localhost:8000/auth/google";
  };

  const logout = async () => {
    try {
      await api.get("/auth/logout");
      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

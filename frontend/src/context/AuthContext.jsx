import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      try {
        const response = await api.get("/auth/me");
        const result = response.data;
        setUser(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data;
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    const user = await api.get("/auth/me");
    const result = user.data;
    setUser(result);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const register = async (full_name, email, password) => {
    await api.post("/auth/register", { full_name, email, password });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext();

// AuthProvider wraps the entire app and exposes auth state globally.
// Any component can call useAuth() to access user, login, logout, register.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // On first render: if a token exists in localStorage, validate it by fetching the user profile.
  // This keeps the user logged in after a page refresh.
  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error) {
        // Token is invalid or expired — clear it to force re-login
        localStorage.removeItem("token");
        setToken(null);
        console.error("Session validation failed:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // Authenticates the user, stores the token, and fetches their profile.
  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { access_token } = response.data;

    localStorage.setItem("token", access_token);
    setToken(access_token);

    const userResponse = await api.get("/auth/me");
    setUser(userResponse.data);
  };

  // Clears all auth state and removes the token from storage.
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Registers a new user. Does NOT auto-login — user is redirected to login page.
  const register = async (fullName, email, password) => {
    await api.post("/auth/register", {
      full_name: fullName,
      email,
      password,
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook — simplifies consuming the context in any component.
export function useAuth() {
  return useContext(AuthContext);
}

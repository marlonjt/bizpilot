import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)

  // Cuando el componente monta, verifica si hay token guardado
  // y obtiene los datos del usuario actual
  useEffect(() => {
    // Si hay token → llama a /auth/me para obtener el user
    // Si no hay token → loading = false
    if (!token) {
      setLoading(false)
      return
    }
    const fetchData = async ( ) => {
      try{
        const response = await api.get("/auth/me");
        const result = response.data
        setUser(result);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);


  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const data = response.data
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    const user = await api.get("/auth/me");
    const result = user.data
    setUser(result);
  }

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}


// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  return useContext(AuthContext)
}

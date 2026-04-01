import axios from "axios";

// Central axios instance — all API calls go through here.
// baseURL is set once so individual requests only need the path (e.g. "/clients/").
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — automatically attaches the JWT token to every request.
// This way no individual component needs to manually add the Authorization header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;

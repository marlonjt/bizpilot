import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor — attaches JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handles token expiration automatically
// Flow: request fails with 401 → try refresh token → retry original request
// If refresh also fails → logout and redirect to login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // prevents infinite retry loop

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          // Request a new access token using the refresh token
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/refresh`,
            { refresh_token: refreshToken }
          );
          const newToken = response.data.access_token;
          localStorage.setItem("token", newToken);

          // Retry the original failed request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch {
          // Refresh token is also expired — force logout
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      } else {
        // No refresh token available — force logout
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

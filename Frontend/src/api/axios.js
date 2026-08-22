import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://a-e-tech-project.onrender.com/api",
  withCredentials: true, // Send httpOnly refresh cookie
});

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

// Request Interceptor: Attach access token
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response Interceptor: Handle 401s and Silent Token Refresh
let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 1. Prevent infinite loops: Do NOT attempt refresh if the failed request WAS the refresh request
    if (original?.url?.includes("/auth/refresh")) {
      setAccessToken(null);
      return Promise.reject(error);
    }

    // 2. Handle 401 Unauthorized for standard requests
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;

      try {
        if (!refreshPromise) {
          refreshPromise = api.post("/auth/refresh").finally(() => {
            refreshPromise = null;
          });
        }

        const { data } = await refreshPromise;
        const newAccessToken = data.accessToken || data.token; // Fallback key check

        setAccessToken(newAccessToken);
        original.headers.Authorization = `Bearer ${newAccessToken}`;

        // Retry original failed request with updated header
        return api(original);
      } catch (refreshErr) {
        setAccessToken(null);
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
import axios, { InternalAxiosRequestConfig } from "axios";
import {
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
} from "../utils/secureStorage";

export {
  getStoredAccessToken,
  setStoredAccessToken,
  getStoredRefreshToken,
  setStoredRefreshToken,
};

// Determine API Base URL for React Native / Expo
const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }
  return "http://localhost:3000/api";
};

export function parseJwt(token: string | null): any {
  try {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function isTokenExpiring(token: string | null, bufferSeconds = 45): boolean {
  if (!token) return true;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - bufferSeconds <= now;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
});

let ongoingRefreshPromise: Promise<string | null> | null = null;

export async function executeMobileTokenRefresh(): Promise<string | null> {
  if (ongoingRefreshPromise) {
    return ongoingRefreshPromise;
  }

  ongoingRefreshPromise = (async () => {
    try {
      const refreshToken = await getStoredRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await axios.post(
        `${getApiBaseUrl()}/auth/refresh`,
        { refreshToken },
        { headers: { "Content-Type": "application/json" } }
      );

      const { data } = response;
      const newAccessToken = data?.accessToken || data?.token;
      const newRefreshToken = data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint.");
      }

      await setStoredAccessToken(newAccessToken);
      if (newRefreshToken) {
        await setStoredRefreshToken(newRefreshToken);
      }

      return newAccessToken;
    } catch (err) {
      await setStoredAccessToken(null);
      await setStoredRefreshToken(null);
      throw err;
    } finally {
      ongoingRefreshPromise = null;
    }
  })();

  return ongoingRefreshPromise;
}

// Attach access token proactively
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const url = config.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (isAuthEndpoint) {
      return config;
    }

    let token = await getStoredAccessToken();

    if (token && isTokenExpiring(token, 45)) {
      try {
        token = await executeMobileTokenRefresh();
      } catch (err) {
        token = await getStoredAccessToken();
      }
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 retry queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    const url = originalRequest.url || "";
    if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
      await setStoredAccessToken(null);
      await setStoredRefreshToken(null);
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const newToken = await executeMobileTokenRefresh();
      processQueue(null, newToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;

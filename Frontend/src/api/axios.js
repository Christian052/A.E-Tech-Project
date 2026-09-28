import axios from "axios";

// Determine appropriate API base endpoint:
// 1. Explicit environment variable (e.g. VITE_API_URL or VITE_BACKEND_URL)
// 2. Vercel deployments (*.vercel.app) -> connect directly to live Render backend
// 3. Local / same-origin environment -> "/api"
export const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (
    typeof window !== "undefined" &&
    window.location.hostname &&
    window.location.hostname.includes("vercel.app")
  ) {
    return "https://a-e-tech-project.onrender.com/api";
  }

  return "/api";
};

/**
 * Safely parse a JWT without external dependencies
 */
export function parseJwt(token) {
  try {
    if (!token || typeof token !== "string") return null;
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

/**
 * Checks whether an access token is expired or will expire within the buffer window (in seconds).
 * Default buffer: 45 seconds to preemptively refresh before API calls.
 */
export function isTokenExpiring(token, bufferSeconds = 45) {
  if (!token) return true;
  const decoded = parseJwt(token);
  if (!decoded || !decoded.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - bufferSeconds <= now;
}

// In-memory token store backed by localStorage for session persistence
let accessToken =
  typeof window !== "undefined"
    ? localStorage.getItem("augu_access_token")
    : null;

let refreshToken =
  typeof window !== "undefined"
    ? localStorage.getItem("augu_refresh_token")
    : null;

export function setAccessToken(token) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("augu_access_token", token);
    } else {
      localStorage.removeItem("augu_access_token");
    }
  }
}

export function setRefreshToken(token) {
  refreshToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("augu_refresh_token", token);
    } else {
      localStorage.removeItem("augu_refresh_token");
    }
  }
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

/**
 * Main Axios client instance
 */
const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true, // Send httpOnly cookies
});

// Single active refresh promise to deduplicate simultaneous requests
let ongoingRefreshPromise = null;

/**
 * Centralized token refresh function.
 * Uses an isolated, raw axios call to bypass api interceptors and prevent recursion.
 */
export async function executeTokenRefresh() {
  if (ongoingRefreshPromise) {
    return ongoingRefreshPromise;
  }

  ongoingRefreshPromise = (async () => {
    try {
      const currentRefreshToken = getRefreshToken();
      const payload = currentRefreshToken ? { refreshToken: currentRefreshToken } : {};

      // Direct axios call ensures no interceptor interception or Authorization header pollution
      const response = await axios.post(`${getApiBaseUrl()}/auth/refresh`, payload, {
        withCredentials: true,
        headers: { "Content-Type": "application/json" },
      });

      const { data } = response;
      const newAccessToken = data?.accessToken || data?.token;
      const newRefreshToken = data?.refreshToken;

      if (!newAccessToken) {
        throw new Error("No access token returned from refresh endpoint.");
      }

      setAccessToken(newAccessToken);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }

      // Notify application listeners (e.g. AuthContext)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("auth:token-refreshed", {
            detail: { accessToken: newAccessToken, user: data?.user },
          })
        );
      }

      return newAccessToken;
    } catch (err) {
      setAccessToken(null);
      setRefreshToken(null);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:session-expired"));
      }

      throw err;
    } finally {
      ongoingRefreshPromise = null;
    }
  })();

  return ongoingRefreshPromise;
}

/**
 * -------------------------------------------------------------
 * 1. REQUEST INTERCEPTOR: Proactive Token Refresh
 * -------------------------------------------------------------
 * Preemptively inspects the JWT. If it is expired or nearing expiry
 * (within buffer window), refreshes the token BEFORE sending the request,
 * entirely preventing 401 Unauthorized errors from occurring.
 */
api.interceptors.request.use(
  async (config) => {
    // Avoid refreshing for authentication endpoints
    const url = config.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh");

    if (isAuthEndpoint) {
      return config;
    }

    let token = getAccessToken();

    // If a token exists and is nearing expiry, refresh it BEFORE dispatching the call
    if (token && isTokenExpiring(token, 45)) {
      try {
        token = await executeTokenRefresh();
      } catch (err) {
        // If proactive refresh fails, let the request proceed or fail naturally
        console.warn("[axios] Proactive token refresh failed before request:", err?.message);
        token = getAccessToken();
      }
    }

    // Attach fresh/current access token
    if (token) {
      if (config.headers) {
        if (typeof config.headers.set === "function") {
          config.headers.set("Authorization", `Bearer ${token}`);
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        config.headers = { Authorization: `Bearer ${token}` };
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * -------------------------------------------------------------
 * 2. RESPONSE INTERCEPTOR: Reactive 401 Queue Handler
 * -------------------------------------------------------------
 * If a request still returns a 401 (e.g. clock drift, sudden token revocation),
 * this interceptor catches the 401, pauses concurrent failed requests in a queue,
 * performs a single token refresh, updates credentials, and replays all queued calls.
 */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only intercept 401 Unauthorized errors with a valid request config
    if (!error.response || error.response.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Do NOT attempt refresh if the failed request itself was an auth endpoint
    const url = originalRequest.url || "";
    if (url.includes("/auth/refresh") || url.includes("/auth/login")) {
      setAccessToken(null);
      setRefreshToken(null);
      return Promise.reject(error);
    }

    // Prevent endless retries of the same request
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // If another request is currently refreshing the token, enqueue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((newToken) => {
          if (originalRequest.headers) {
            if (typeof originalRequest.headers.set === "function") {
              originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
            } else {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
          }
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    isRefreshing = true;

    try {
      const newToken = await executeTokenRefresh();
      processQueue(null, newToken);

      if (originalRequest.headers) {
        if (typeof originalRequest.headers.set === "function") {
          originalRequest.headers.set("Authorization", `Bearer ${newToken}`);
        } else {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
      }

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

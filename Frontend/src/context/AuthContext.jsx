// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import api, {
  setAccessToken,
  setRefreshToken,
  getRefreshToken,
  executeTokenRefresh,
} from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Start with true because we need to check
  // whether the user already has a valid refresh session.
  const [loading, setLoading] = useState(true);

  // Synchronize state when tokens refresh or session expires globally
  useEffect(() => {
    const handleSessionExpired = () => {
      setUser(null);
    };

    const handleTokenRefreshed = (e) => {
      if (e.detail?.user) {
        setUser(e.detail.user);
      }
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    window.addEventListener("auth:token-refreshed", handleTokenRefreshed);

    return () => {
      window.removeEventListener("auth:session-expired", handleSessionExpired);
      window.removeEventListener("auth:token-refreshed", handleTokenRefreshed);
    };
  }, []);

  /**
   * Restore the user's session after:
   * - Browser refresh
   * - Browser reload
   * - Opening the application again
   */
  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      try {
        await executeTokenRefresh();

        /*
         * Fetch authenticated user details with fresh token
         */
        if (mounted) {
          const userResponse = await api.get("/auth/me");
          setUser(userResponse.data.user || userResponse.data);
        }
      } catch (error) {
        /*
         * No valid refresh token/session.
         * The user is genuinely logged out.
         */
        setAccessToken(null);
        setRefreshToken(null);

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Login
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        email,
        password,
      });

      if (!data.accessToken) {
        throw new Error("No access token received");
      }

      // Save tokens
      setAccessToken(data.accessToken);
      if (data.refreshToken) {
        setRefreshToken(data.refreshToken);
      }

      // Save authenticated user
      setUser(data.user);

      return {
        success: true,
      };
    } catch (err) {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);

      const message =
        err.response?.data?.message ||
        "Login failed. Please try again.";

      return {
        success: false,
        message,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout
   */
  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Ignore network errors during logout
    } finally {
      // Remove tokens
      setAccessToken(null);
      setRefreshToken(null);

      // Remove user from React state
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Auth hook
 */
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return ctx;
}
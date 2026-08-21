// src/context/AuthContext.jsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

import api, { setAccessToken } from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  // Start with true because we need to check
  // whether the user already has a valid refresh session.
  const [loading, setLoading] = useState(true);

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
        /*
         * The refresh token is stored in an HTTP-only cookie.
         *
         * Because axios has:
         * withCredentials: true
         *
         * the browser automatically sends the cookie.
         */
        const { data } = await api.post("/auth/refresh");

        const newAccessToken = data.accessToken || data.token;

        if (!newAccessToken) {
          throw new Error("No access token returned from refresh");
        }

        // Store the new access token in memory
        setAccessToken(newAccessToken);

        /*
         * If your /auth/refresh endpoint returns the user,
         * use it directly.
         */
        if (mounted && data.user) {
          setUser(data.user);
          return;
        }

        /*
         * If /auth/refresh does NOT return the user,
         * try /auth/me.
         */
        if (mounted) {
          const userResponse = await api.get("/auth/me");

          setUser(
            userResponse.data.user || userResponse.data
          );
        }
      } catch (error) {
        /*
         * No valid refresh token/session.
         * The user is genuinely logged out.
         */
        setAccessToken(null);

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

      // Save access token in memory
      setAccessToken(data.accessToken);

      // Save authenticated user
      setUser(data.user);

      return {
        success: true,
      };
    } catch (err) {
      setAccessToken(null);
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
      // Remove access token from memory
      setAccessToken(null);

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
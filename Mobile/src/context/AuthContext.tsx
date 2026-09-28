import React, { createContext, useContext, useState, useEffect } from "react";
import api, {
  setStoredAccessToken,
  setStoredRefreshToken,
  getStoredRefreshToken,
  executeMobileTokenRefresh,
} from "../api/client";
import { User } from "../types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateUserInContext: (updatedUser: Partial<User>) => void;
  refreshUserProfile: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUserProfile = async () => {
    try {
      const meRes = await api.get("/auth/me");
      const fetched = meRes.data?.user || meRes.data;
      setUser(fetched);
    } catch (e) {
      console.warn("[AuthContext] Failed to reload profile:", e);
    }
  };

  // Restore authenticated session securely across app restarts
  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      try {
        const storedRefreshToken = await getStoredRefreshToken();
        if (!storedRefreshToken) {
          if (isMounted) setLoading(false);
          return;
        }

        await executeMobileTokenRefresh();
        const meRes = await api.get("/auth/me");
        if (isMounted) {
          setUser(meRes.data?.user || meRes.data);
        }
      } catch (err) {
        await setStoredAccessToken(null);
        await setStoredRefreshToken(null);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const response = await api.post("/auth/login", {
        email: email.trim(),
        password: pass,
      });

      const { data } = response;
      if (!data.accessToken) {
        throw new Error("No access token received from server");
      }

      await setStoredAccessToken(data.accessToken);
      if (data.refreshToken) {
        await setStoredRefreshToken(data.refreshToken);
      }

      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      await setStoredAccessToken(null);
      await setStoredRefreshToken(null);
      setUser(null);
      return {
        success: false,
        message: err.response?.data?.message || err.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {}
    await setStoredAccessToken(null);
    await setStoredRefreshToken(null);
    setUser(null);
  };

  const updateUserInContext = (updatedFields: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        updateUserInContext,
        refreshUserProfile,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

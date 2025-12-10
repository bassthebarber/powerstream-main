import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api.js";
import { getToken, saveToken, clearToken } from "../utils/auth.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from token
  useEffect(() => {
    async function initAuth() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        // Verify token and get user info
        const res = await api.get("/users/me");
        if (res.data?.ok && res.data?.user) {
          // Ensure coinBalance is included
          const userWithCoins = {
            ...res.data.user,
            coinBalance: typeof res.data.user.coinBalance === "number" ? res.data.user.coinBalance : 0,
          };
          setUser(userWithCoins);
        } else if (res.data?.user) {
          // Fallback for different response format
          const userWithCoins = {
            ...res.data.user,
            coinBalance: typeof res.data.user.coinBalance === "number" ? res.data.user.coinBalance : 0,
          };
          setUser(userWithCoins);
        } else {
          // Invalid token, clear it
          clearToken();
        }
      } catch (err) {
        // Token invalid or expired - silently clear (this is normal for logged out users)
        clearToken();
      } finally {
        setLoading(false);
      }
    }

    initAuth();
  }, []);

  const signIn = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user: userData } = res.data;

      if (!token) {
        throw new Error("No token returned from server");
      }

      saveToken(token);
      // Also save as ps_token for PowerLine API compatibility
      localStorage.setItem("ps_token", token);
      localStorage.setItem("ps_user_id", userData._id || userData.id || "");
      
      // Ensure coinBalance is included
      const userWithCoins = {
        ...userData,
        coinBalance: typeof userData.coinBalance === "number" ? userData.coinBalance : 0,
      };
      setUser(userWithCoins);
      return { token, user: userWithCoins };
    } catch (error) {
      console.error("Sign in error:", error);
      
      // Enhance error message for network errors
      if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
        const enhancedError = new Error(
          "Unable to connect to PowerStream server. Please check that the backend is running on port 5001."
        );
        enhancedError.originalError = error;
        enhancedError.isNetworkError = true;
        throw enhancedError;
      }
      
      throw error;
    }
  };

  const signUp = async (email, password, name = "") => {
    try {
      const res = await api.post("/auth/register", { email, password, name });
      const { token, user: userData } = res.data;

      if (!token) {
        throw new Error("No token returned from server");
      }

      saveToken(token);
      // Also save as ps_token for PowerLine API compatibility
      localStorage.setItem("ps_token", token);
      localStorage.setItem("ps_user_id", userData._id || userData.id || "");
      
      // Ensure coinBalance is included
      const userWithCoins = {
        ...userData,
        coinBalance: typeof userData.coinBalance === "number" ? userData.coinBalance : 0,
      };
      setUser(userWithCoins);
      return { token, user: userWithCoins };
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      clearToken();
      // Also clear PowerLine tokens
      localStorage.removeItem("ps_token");
      localStorage.removeItem("ps_user_id");
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const res = await api.get("/users/me");
      if (res.data?.ok && res.data?.user) {
        const userWithCoins = {
          ...res.data.user,
          coinBalance: typeof res.data.user.coinBalance === "number" ? res.data.user.coinBalance : 0,
        };
        setUser(userWithCoins);
        return userWithCoins;
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
    return null;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
    setUser, // Expose setUser for direct updates
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

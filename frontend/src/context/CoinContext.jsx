// frontend/src/context/CoinContext.jsx
// Coin/monetization context per Overlord Spec
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext.jsx";

const CoinContext = createContext(null);

export function CoinProvider({ children }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current balance
  const refreshBalance = useCallback(async () => {
    if (!user) {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);
      const response = await api.get("/monetization/coins/balance");
      if (response.data.success) {
        setBalance(response.data.data.balance);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      // Fallback to user's stored balance
      setBalance(user.coinsBalance || 0);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch transaction history
  const fetchHistory = useCallback(async (options = {}) => {
    if (!user) return [];

    const { limit = 20, skip = 0 } = options;

    try {
      setLoading(true);
      const response = await api.get("/monetization/coins/history", {
        params: { limit, skip },
      });
      if (response.data.success) {
        const transactions = response.data.data.transactions;
        setHistory(transactions);
        return transactions;
      }
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
    return [];
  }, [user]);

  // Send coins (tip)
  const sendCoins = useCallback(async (recipientId, amount, memo = "") => {
    if (!user) return { success: false, message: "Not logged in" };

    try {
      setLoading(true);
      const response = await api.post("/monetization/coins/send", {
        recipientId,
        amount,
        memo,
      });

      if (response.data.success) {
        setBalance(response.data.data.newBalance);
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      console.error("Failed to send coins:", err);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send coins",
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Claim daily faucet
  const claimFaucet = useCallback(async () => {
    if (!user) return { success: false, message: "Not logged in" };

    try {
      setLoading(true);
      const response = await api.post("/monetization/coins/faucet");

      if (response.data.success) {
        setBalance(response.data.data.newBalance);
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Failed to claim daily coins",
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Purchase coins
  const purchaseCoins = useCallback(async (amount, paymentMethod, paymentToken) => {
    if (!user) return { success: false, message: "Not logged in" };

    try {
      setLoading(true);
      const response = await api.post("/monetization/coins/purchase", {
        amount,
        paymentMethod,
        paymentToken,
      });

      if (response.data.success) {
        setBalance(response.data.data.newBalance);
        return { success: true, data: response.data.data };
      }

      return { success: false, message: response.data.message };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Purchase failed",
      };
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initialize balance when user changes
  useEffect(() => {
    if (user) {
      setBalance(user.coinsBalance || 0);
      refreshBalance();
    } else {
      setBalance(0);
      setHistory([]);
    }
  }, [user, refreshBalance]);

  const value = {
    balance,
    history,
    loading,
    error,
    refreshBalance,
    fetchHistory,
    sendCoins,
    claimFaucet,
    purchaseCoins,
  };

  return (
    <CoinContext.Provider value={value}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error("useCoins must be used within a CoinProvider");
  }
  return context;
}

export default CoinContext;



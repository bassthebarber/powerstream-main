import React, { useState } from "react";
import { buyCoins } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/theme.css";

const COIN_PACKAGES = [
  { amount: 100, label: "100 Coins", price: "$0.99" },
  { amount: 500, label: "500 Coins", price: "$4.99" },
  { amount: 1000, label: "1,000 Coins", price: "$9.99" },
  { amount: 5000, label: "5,000 Coins", price: "$39.99" },
  { amount: 10000, label: "10,000 Coins", price: "$79.99" },
];

export default function BuyCoinsModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleBuy = async () => {
    if (!selectedAmount) {
      setError("Please select a coin package");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await buyCoins({ amount: selectedAmount });
      if (result?.ok) {
        setSuccess(`Successfully purchased ${selectedAmount} coins!`);
        // Refresh user data to get updated balance
        if (refreshUser) {
          await refreshUser();
        }
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(result);
            onClose();
          }, 1500);
        } else {
          setTimeout(() => {
            onClose();
          }, 1500);
        }
      } else {
        setError(result?.message || "Failed to buy coins");
      }
    } catch (err) {
      console.error("Error buying coins:", err);
      setError(err.response?.data?.message || "Failed to buy coins");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#111",
          borderRadius: 16,
          padding: 24,
          maxWidth: 500,
          width: "90%",
          border: "1px solid var(--ps-gold)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ margin: 0, color: "var(--ps-gold)", fontSize: "1.5rem" }}>Buy PowerCoins</h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "24px",
              cursor: "pointer",
              padding: 0,
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>
        </div>

        {user && (
          <div style={{ marginBottom: 20, padding: 12, background: "rgba(255,184,77,0.1)", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Current Balance</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ps-gold)" }}>
              {typeof user.coinBalance === "number" ? user.coinBalance.toLocaleString() : "0"} Coins
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              padding: 12,
              background: "rgba(239,68,68,0.15)",
              border: "1px solid #ef4444",
              borderRadius: 8,
              color: "#ef4444",
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              padding: 12,
              background: "rgba(74,222,128,0.15)",
              border: "1px solid #4ade80",
              borderRadius: 8,
              color: "#4ade80",
              marginBottom: 16,
              fontSize: 14,
            }}
          >
            {success}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 14, color: "#888", marginBottom: 12 }}>Select Package</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
            {COIN_PACKAGES.map((pkg) => (
              <button
                key={pkg.amount}
                onClick={() => setSelectedAmount(pkg.amount)}
                disabled={loading}
                style={{
                  padding: 16,
                  background: selectedAmount === pkg.amount ? "rgba(255,184,77,0.2)" : "rgba(255,255,255,0.05)",
                  border: `2px solid ${selectedAmount === pkg.amount ? "var(--ps-gold)" : "rgba(255,255,255,0.1)"}`,
                  borderRadius: 8,
                  color: "#fff",
                  cursor: loading ? "not-allowed" : "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{pkg.label}</div>
                <div style={{ fontSize: 14, color: "var(--ps-gold)" }}>{pkg.price}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1,
              padding: 12,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: 8,
              color: "#fff",
              cursor: loading ? "not-allowed" : "pointer",
              fontWeight: 600,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleBuy}
            disabled={loading || !selectedAmount}
            style={{
              flex: 1,
              padding: 12,
              background: loading || !selectedAmount ? "#666" : "var(--ps-gold)",
              border: "none",
              borderRadius: 8,
              color: loading || !selectedAmount ? "#999" : "#000",
              cursor: loading || !selectedAmount ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Processing..." : "Buy Coins"}
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: "#666", textAlign: "center" }}>
          * Payment processing is mocked for development
        </div>
      </div>
    </div>
  );
}


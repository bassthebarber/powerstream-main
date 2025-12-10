import React, { useState } from "react";
import { tipCreator } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/theme.css";

const TIP_AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function TipButton({ postId, postAuthorName, onSuccess }) {
  const { user, setUser } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTip = async () => {
    const amount = selectedAmount || (customAmount ? parseInt(customAmount) : null);
    if (!amount || amount <= 0) {
      setError("Please select or enter a tip amount");
      return;
    }

    if (!user || typeof user.coinBalance !== "number" || user.coinBalance < amount) {
      setError("Insufficient coins. Buy more coins to tip.");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await tipCreator({ postId, amount });
      if (result?.ok) {
        setSuccess(`Tipped ${amount} coins to ${postAuthorName || "creator"}!`);
        // Refresh user data to get updated balance
        if (refreshUser) {
          await refreshUser();
        }
        // Call onSuccess callback if provided
        if (onSuccess) {
          setTimeout(() => {
            onSuccess(result);
            setShowModal(false);
            setSelectedAmount(null);
            setCustomAmount("");
          }, 1500);
        } else {
          setTimeout(() => {
            setShowModal(false);
            setSelectedAmount(null);
            setCustomAmount("");
          }, 1500);
        }
      } else {
        setError(result?.message || "Failed to send tip");
      }
    } catch (err) {
      console.error("Error tipping:", err);
      setError(err.response?.data?.message || "Failed to send tip");
    } finally {
      setLoading(false);
    }
  };

  const currentBalance = typeof user?.coinBalance === "number" ? user.coinBalance : 0;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        style={{
          border: "none",
          background: "transparent",
          color: "var(--ps-gold)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 12,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        🪙 Tip
      </button>

      {showModal && (
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
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#111",
              borderRadius: 16,
              padding: 24,
              maxWidth: 400,
              width: "90%",
              border: "1px solid var(--ps-gold)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "var(--ps-gold)", fontSize: "1.2rem" }}>Tip Creator</h3>
              <button
                onClick={() => setShowModal(false)}
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

            <div style={{ marginBottom: 16, padding: 12, background: "rgba(255,184,77,0.1)", borderRadius: 8 }}>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>Your Balance</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--ps-gold)" }}>
                {currentBalance.toLocaleString()} Coins
              </div>
            </div>

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

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>Quick Amounts</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {TIP_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                    }}
                    disabled={loading || currentBalance < amount}
                    style={{
                      padding: 10,
                      background:
                        selectedAmount === amount
                          ? "rgba(255,184,77,0.2)"
                          : currentBalance < amount
                          ? "rgba(255,255,255,0.02)"
                          : "rgba(255,255,255,0.05)",
                      border: `2px solid ${
                        selectedAmount === amount ? "var(--ps-gold)" : "rgba(255,255,255,0.1)"
                      }`,
                      borderRadius: 8,
                      color: currentBalance < amount ? "#666" : "#fff",
                      cursor: loading || currentBalance < amount ? "not-allowed" : "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {amount}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>Custom Amount</div>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                placeholder="Enter amount"
                min="1"
                max={currentBalance}
                disabled={loading}
                style={{
                  width: "100%",
                  padding: 12,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 14,
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setShowModal(false)}
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
                onClick={handleTip}
                disabled={loading || (!selectedAmount && !customAmount)}
                style={{
                  flex: 1,
                  padding: 12,
                  background: loading || (!selectedAmount && !customAmount) ? "#666" : "var(--ps-gold)",
                  border: "none",
                  borderRadius: 8,
                  color: loading || (!selectedAmount && !customAmount) ? "#999" : "#000",
                  cursor: loading || (!selectedAmount && !customAmount) ? "not-allowed" : "pointer",
                  fontWeight: 700,
                }}
              >
                {loading ? "Sending..." : "Send Tip"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


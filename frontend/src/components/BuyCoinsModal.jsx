import React, { useState, useEffect } from "react";
import { buyCoins } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";
import ServiceNotConfiguredBanner from "./ServiceNotConfiguredBanner.jsx";
import "../styles/theme.css";

// Fallback packages in case API is unavailable
const FALLBACK_PACKAGES = [
  { id: "pack_100", coins: 100, label: "100 Coins", price: 0.99 },
  { id: "pack_500", coins: 500, label: "500 Coins", price: 4.99, popular: true },
  { id: "pack_1000", coins: 1000, label: "1,000 Coins", price: 9.99 },
  { id: "pack_5000", coins: 5000, label: "5,000 Coins", price: 39.99, bestValue: true },
  { id: "pack_10000", coins: 10000, label: "10,000 Coins", price: 74.99 },
];

export default function BuyCoinsModal({ isOpen, onClose, onSuccess }) {
  const { user, refreshUser } = useAuth();
  const [packages, setPackages] = useState(FALLBACK_PACKAGES);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [paymentsAvailable, setPaymentsAvailable] = useState(true);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Load packages on mount
  useEffect(() => {
    if (!isOpen) return;
    
    const loadPackages = async () => {
      setLoadingPackages(true);
      try {
        // Check payments service health
        const res = await api.get("/payments/health");
        if (res.data?.ok) {
          // Check if any payment provider is configured
          const hasProvider = res.data.providers?.paypal || res.data.providers?.stripe;
          setPaymentsAvailable(hasProvider);
        }
        
        // Try to load packages from coins endpoint first
        try {
          const packagesRes = await api.get("/coins/packages");
          if (packagesRes.data?.packages) {
            setPackages(packagesRes.data.packages);
          }
        } catch {
          // Fall back to payments endpoint
          const packagesRes = await api.get("/payments/packages");
          if (packagesRes.data?.packages) {
            setPackages(packagesRes.data.packages);
          }
        }
      } catch (err) {
        console.debug("[BuyCoins] Payment service check:", err.message);
        // Use fallback packages - payments might not be configured
        setPaymentsAvailable(false);
      } finally {
        setLoadingPackages(false);
      }
    };
    
    loadPackages();
  }, [isOpen]);

  const handleBuy = async () => {
    if (!selectedPackage) {
      setError("Please select a coin package");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Try to create a real checkout session first
      const checkoutRes = await api.post("/coins/checkout", {
        packageId: selectedPackage.id,
        provider: "stripe",
      });

      if (checkoutRes.data?.url) {
        // Redirect to Stripe checkout
        window.location.href = checkoutRes.data.url;
        return;
      }

      // Fallback to mock buy (for development)
      const result = await buyCoins({ amount: selectedPackage.coins });
      if (result?.ok) {
        setSuccess(`Successfully purchased ${selectedPackage.coins} coins!`);
        if (refreshUser) {
          await refreshUser();
        }
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
      } else if (result?.code === "SERVICE_NOT_CONFIGURED") {
        setError("Payments are not configured yet. Please try again later.");
        setPaymentsAvailable(false);
      } else {
        setError(result?.message || "Failed to buy coins");
      }
    } catch (err) {
      console.error("Error buying coins:", err);
      const errData = err.response?.data;
      if (errData?.code === "SERVICE_NOT_CONFIGURED") {
        setPaymentsAvailable(false);
        setError("Payment processing is not available yet.");
      } else {
        setError(errData?.message || "Failed to buy coins");
      }
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

        {!paymentsAvailable && (
          <ServiceNotConfiguredBanner
            message="Payment processing is being set up. Purchases will be available soon!"
            type="warning"
            icon="💳"
            dismissible={false}
          />
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
          {loadingPackages ? (
            <div style={{ textAlign: "center", padding: 20, color: "#888" }}>Loading packages...</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
              {packages.map((pkg) => (
                <button
                  key={pkg.id || pkg.coins}
                  onClick={() => setSelectedPackage(pkg)}
                  disabled={loading || !paymentsAvailable}
                  style={{
                    padding: 16,
                    background: selectedPackage?.id === pkg.id ? "rgba(255,184,77,0.2)" : "rgba(255,255,255,0.05)",
                    border: `2px solid ${selectedPackage?.id === pkg.id ? "var(--ps-gold)" : "rgba(255,255,255,0.1)"}`,
                    borderRadius: 8,
                    color: "#fff",
                    cursor: loading || !paymentsAvailable ? "not-allowed" : "pointer",
                    textAlign: "left",
                    transition: "all 0.2s",
                    position: "relative",
                    opacity: paymentsAvailable ? 1 : 0.5,
                  }}
                >
                  {pkg.popular && (
                    <span style={{
                      position: "absolute",
                      top: -8,
                      right: 8,
                      background: "var(--ps-gold)",
                      color: "#000",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}>POPULAR</span>
                  )}
                  {pkg.bestValue && (
                    <span style={{
                      position: "absolute",
                      top: -8,
                      right: 8,
                      background: "#4ade80",
                      color: "#000",
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                    }}>BEST VALUE</span>
                  )}
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{pkg.label}</div>
                  <div style={{ fontSize: 14, color: "var(--ps-gold)" }}>${pkg.price?.toFixed(2) || pkg.price}</div>
                </button>
              ))}
            </div>
          )}
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
            disabled={loading || !selectedPackage || !paymentsAvailable}
            style={{
              flex: 1,
              padding: 12,
              background: loading || !selectedPackage || !paymentsAvailable ? "#666" : "var(--ps-gold)",
              border: "none",
              borderRadius: 8,
              color: loading || !selectedPackage || !paymentsAvailable ? "#999" : "#000",
              cursor: loading || !selectedPackage || !paymentsAvailable ? "not-allowed" : "pointer",
              fontWeight: 700,
            }}
          >
            {loading ? "Processing..." : paymentsAvailable ? "Buy Coins" : "Coming Soon"}
          </button>
        </div>

        <div style={{ marginTop: 16, fontSize: 11, color: "#666", textAlign: "center" }}>
          {paymentsAvailable ? "Secure payment powered by Stripe" : "Payment processing will be available soon"}
        </div>
      </div>
    </div>
  );
}


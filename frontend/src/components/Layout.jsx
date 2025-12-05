import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import BottomDock from "./BottomDock.jsx";
import BuyCoinsModal from "./BuyCoinsModal.jsx";
import "../styles/theme.css";

const routeTitles = {
  "/powerfeed": "PowerFeed",
  "/powergram": "PowerGram",
  "/powerreel": "PowerReel",
  "/powerline": "PowerLine",
  "/tv-stations": "TV Stations",
  "/southern-power": "Southern Power Network",
  "/world-tv": "World TV",
  "/studio": "AI Studio",
};

const getTitleForPath = (pathname = "") => {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith("/tv-stations/")) return "Station Detail";
  if (pathname.startsWith("/ps-tv")) return "PowerStream TV";
  if (pathname.startsWith("/powerstream-tv")) return "PowerStream TV";
  return "PowerStream";
};

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading, refreshUser } = useAuth();
  const [showBuyCoins, setShowBuyCoins] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login", { replace: true, state: { from: location } });
    }
  }, [user, loading, navigate, location]);

  if (!user) {
    return (
      <div
        style={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ps-gold)",
        }}
      >
        Loading...
      </div>
    );
  }

  const title = getTitleForPath(location.pathname);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--ps-bg)",
        color: "var(--ps-text)",
        paddingBottom: "72px",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 24px",
          background:
            "linear-gradient(135deg, var(--ps-black-light), var(--ps-black))",
          borderBottom: `1px solid var(--ps-border)`,
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
          onClick={() => navigate("/powerfeed")}
        >
          <img
            src="/logos/powerstream-logo.png"
            alt="PowerStream"
            style={{ width: "44px", height: "44px", objectFit: "contain" }}
          />
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "var(--ps-gold)",
                letterSpacing: "0.03em",
              }}
            >
              PowerStream
            </div>
            <div style={{ fontSize: "0.85rem", color: "var(--ps-gold-lighter)" }}>{title}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {/* Coin Balance */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              background: "var(--ps-btn-secondary-bg)",
              border: "1px solid var(--ps-btn-secondary-border)",
              borderRadius: "20px",
              cursor: "pointer",
            }}
            onClick={() => setShowBuyCoins(true)}
          >
            <span style={{ fontSize: "16px" }}>🪙</span>
            <span
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "var(--ps-gold)",
              }}
            >
              {typeof user?.coinBalance === "number"
                ? user.coinBalance.toLocaleString()
                : "0"}
            </span>
          </div>

          {/* User Avatar & Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              cursor: "pointer",
            }}
            onClick={() => navigate("/profile")}
          >
            <div style={{ textAlign: "right", lineHeight: 1.2 }}>
              <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                {user?.name || "Member"}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--ps-text-muted)" }}>
                {user?.email}
              </div>
            </div>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                overflow: "hidden",
                border: `2px solid var(--ps-gold)`,
                boxShadow: `0 0 12px var(--ps-gold)`,
              }}
            >
              <img
                src={user?.avatarUrl || "/logos/powerstream-logo.png"}
                alt="avatar"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </header>

      <main style={{ padding: "24px" }}>{children}</main>

      <BottomDock currentPath={location.pathname} />

      <BuyCoinsModal
        isOpen={showBuyCoins}
        onClose={() => setShowBuyCoins(false)}
        onSuccess={async () => {
          // Refresh user balance after purchase
          if (refreshUser) {
            await refreshUser();
          }
        }}
      />
    </div>
  );
};

export default Layout;



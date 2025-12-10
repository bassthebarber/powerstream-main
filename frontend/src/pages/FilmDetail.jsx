// frontend/src/pages/FilmDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";

export default function FilmDetail() {
  const { id } = useParams();
  const [film, setFilm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    fetchFilm();
  }, [id]);

  const fetchFilm = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ps-tv/titles/${id}`);
      const data = await res.json();
      if (data.ok) {
        setFilm(data.title);
        // Check if unlocked (for now, free content is always unlocked)
        if (data.title.monetization?.type === "free") {
          setUnlocked(true);
        }
      }
    } catch (err) {
      console.error("Error fetching film:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/ps-tv/titles/${id}/unlock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId") || "guest",
          paymentMethod: "coins",
        }),
      });
      const data = await res.json();
      if (data.ok && data.unlocked) {
        setUnlocked(true);
      }
    } catch (err) {
      console.error("Error unlocking film:", err);
    }
  };

  if (loading) {
    return (
      <div className="ps-page">
        <p style={{ textAlign: "center", opacity: 0.7 }}>Loading film...</p>
      </div>
    );
  }

  if (!film) {
    return (
      <div className="ps-page">
        <p style={{ textAlign: "center", opacity: 0.7 }}>Film not found</p>
        <Link to="/ps-tv" className="ps-back">← Back to PowerStream TV</Link>
      </div>
    );
  }

  const canPlay = unlocked || film.monetization?.type === "free";
  const videoUrl = film.hlsUrl || film.videoUrl;

  return (
    <div className="ps-page">
      <Link to="/ps-tv" className="ps-back" style={{ marginBottom: 24 }}>
        ← Back to PowerStream TV
      </Link>

      {/* Hero Section */}
      {film.bannerUrl && (
        <div
          style={{
            height: "50vh",
            background: `linear-gradient(to bottom, transparent, #000), url(${film.bannerUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: 12,
            marginBottom: 32,
            display: "flex",
            alignItems: "flex-end",
            padding: 32,
          }}
        >
          <div style={{ maxWidth: 600 }}>
            <h1 style={{ fontSize: "3rem", marginBottom: 16 }}>{film.title}</h1>
            <p style={{ fontSize: "1.2rem", opacity: 0.9, marginBottom: 16 }}>{film.description}</p>
            {film.genre && film.genre.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                {film.genre.map((g, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "4px 12px",
                      background: "rgba(230,184,0,0.2)",
                      border: "1px solid var(--gold)",
                      borderRadius: 16,
                      fontSize: 12,
                    }}
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            {film.duration && (
              <p style={{ fontSize: 14, opacity: 0.7 }}>
                {Math.floor(film.duration / 60)} min
              </p>
            )}
          </div>
        </div>
      )}

      {/* Video Player or Lock Screen */}
      <div className="ps-card" style={{ marginBottom: 32 }}>
        {canPlay && videoUrl ? (
          <>
            <h2 style={{ marginBottom: 16 }}>Watch Now</h2>
            <div style={{ position: "relative", paddingBottom: "56.25%", background: "#000", borderRadius: 8, overflow: "hidden" }}>
              <video
                src={videoUrl}
                controls
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 24px" }}>
            <h2 style={{ marginBottom: 16 }}>Unlock to Watch</h2>
            <p style={{ marginBottom: 24, opacity: 0.8 }}>
              {film.monetization?.type === "rental"
                ? `Rent for ${film.monetization.priceCoins} coins or $${film.monetization.priceUSD}`
                : film.monetization?.type === "purchase"
                ? `Purchase for ${film.monetization.priceCoins} coins or $${film.monetization.priceUSD}`
                : "This content requires a subscription"}
            </p>
            <button
              onClick={handleUnlock}
              style={{
                padding: "12px 32px",
                background: "var(--gold)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "1.1rem",
                cursor: "pointer",
              }}
            >
              {film.monetization?.type === "rental" ? "Rent Now" : film.monetization?.type === "purchase" ? "Purchase" : "Subscribe"}
            </button>
          </div>
        )}
      </div>

      {/* Description */}
      {film.description && (
        <div className="ps-card">
          <h2 style={{ marginBottom: 16 }}>About</h2>
          <p style={{ lineHeight: 1.6, opacity: 0.9 }}>{film.description}</p>
        </div>
      )}
    </div>
  );
}














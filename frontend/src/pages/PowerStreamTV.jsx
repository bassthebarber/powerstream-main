// frontend/src/pages/PowerStreamTV.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

export default function PowerStreamTV() {
  const [titles, setTitles] = useState([]);
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories] = useState([
    "Featured",
    "New Releases",
    "Documentary",
    "Independent Films",
    "Music Docs",
    "Reality TV",
    "News & Community",
  ]);

  useEffect(() => {
    fetchTitles();
  }, []);

  const fetchTitles = async () => {
    try {
      setLoading(true);
      const res = await api.get("/ps-tv/titles?limit=50");
      if (res.data?.ok) {
        const titlesList = res.data.titles || [];
        setTitles(titlesList);
        if (titlesList.length > 0) {
          setFeatured(titlesList[0]);
        }
      } else if (res.data?.titles) {
        setTitles(res.data.titles);
        if (res.data.titles.length > 0) {
          setFeatured(res.data.titles[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching titles:", err);
    } finally {
      setLoading(false);
    }
  };

  const getTitlesByCategory = (category) => {
    if (category === "Featured") {
      // Featured titles - prioritize SPS network content
      const featured = titles.filter((t) => t.network === "Southern Power Syndicate" || t.stationSlug);
      return featured.length > 0 ? featured.slice(0, 10) : titles.slice(0, 5);
    }
    if (category === "New Releases") {
      // Most recent titles
      return titles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
    }
    return titles.filter((t) => t.category === category || t.genre?.includes(category));
  };

  return (
    <div className="ps-page" style={{ padding: 0 }}>
      {/* Hero Banner */}
      {featured && (
        <div
          style={{
            position: "relative",
            height: "70vh",
            minHeight: 500,
            background: featured.bannerUrl || featured.posterUrl
              ? `linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.8)), url(${featured.bannerUrl || featured.posterUrl})`
              : "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: "flex",
            alignItems: "flex-end",
            padding: "60px 48px",
          }}
        >
          <div style={{ maxWidth: 700, zIndex: 2 }}>
            <h1
              style={{
                fontSize: "4rem",
                marginBottom: 20,
                textShadow: "0 4px 20px rgba(0,0,0,0.8)",
                lineHeight: 1.1,
              }}
            >
              {featured.title}
            </h1>
            <p
              style={{
                fontSize: "1.3rem",
                opacity: 0.95,
                marginBottom: 32,
                lineHeight: 1.5,
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                maxWidth: 600,
              }}
            >
              {featured.description}
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {featured.genre && featured.genre.slice(0, 3).map((g, idx) => (
                <span
                  key={idx}
                  style={{
                    padding: "6px 14px",
                    background: "rgba(230,184,0,0.2)",
                    border: "1px solid var(--gold)",
                    borderRadius: 20,
                    fontSize: 13,
                    color: "var(--gold)",
                    fontWeight: 600,
                  }}
                >
                  {g}
                </span>
              ))}
              {featured.duration && (
                <span style={{ fontSize: 14, opacity: 0.8 }}>
                  {Math.floor(featured.duration / 60)} min
                </span>
              )}
            </div>
            <Link
              to={`/ps-tv/title/${featured._id}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 36px",
                background: "var(--gold)",
                color: "#000",
                textDecoration: "none",
                borderRadius: 8,
                fontWeight: 700,
                fontSize: "1.2rem",
                transition: "all 0.3s",
                boxShadow: "0 4px 16px rgba(230,184,0,0.4)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#ffda5c";
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(230,184,0,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--gold)";
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(230,184,0,0.4)";
              }}
            >
              ▶️ Watch Now
            </Link>
          </div>
        </div>
      )}

      <div style={{ padding: "32px 24px" }}>
        {loading ? (
          <p style={{ textAlign: "center", opacity: 0.7 }}>Loading titles...</p>
        ) : (
          categories.map((category) => {
            const categoryTitles = getTitlesByCategory(category);
            if (categoryTitles.length === 0 && category !== "Featured") return null;

            return (
              <div key={category} style={{ marginBottom: 48 }}>
                <h2 style={{ marginBottom: 16, fontSize: "1.5rem" }}>{category}</h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                    gap: 16,
                    overflowX: "auto",
                  }}
                >
                  {categoryTitles.map((title) => (
                    <Link
                      key={title._id}
                      to={`/ps-tv/title/${title._id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          aspectRatio: "2/3",
                          borderRadius: 8,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.1)",
                          transition: "transform 0.2s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                      >
                        {title.posterUrl ? (
                          <img
                            src={title.posterUrl}
                            alt={title.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#fff",
                              fontSize: 14,
                              textAlign: "center",
                              padding: 16,
                            }}
                          >
                            {title.title}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })
        )}

        {titles.length === 0 && !loading && (
          <p style={{ textAlign: "center", opacity: 0.7 }}>No titles available yet</p>
        )}
      </div>
    </div>
  );
}


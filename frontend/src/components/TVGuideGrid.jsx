import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const gold = "#ffb84d";

export default function TVGuideGrid({ shows, onShowClick }) {
  const navigate = useNavigate();
  // Group shows by station
  const showsByStation = useMemo(() => {
    const grouped = {};
    shows.forEach((show) => {
      const stationId = show.stationId?._id || show.stationId;
      const stationName = show.stationId?.name || "Unknown Station";
      const stationSlug = show.stationId?.slug;
      const stationLogo = show.stationId?.logoUrl;

      if (!grouped[stationId]) {
        grouped[stationId] = {
          station: {
            _id: stationId,
            name: stationName,
            slug: stationSlug,
            logoUrl: stationLogo,
          },
          shows: [],
        };
      }
      grouped[stationId].shows.push(show);
    });

    // Sort shows within each station by startTime
    Object.values(grouped).forEach((group) => {
      group.shows.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    });

    return Object.values(grouped);
  }, [shows]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  const isLive = (show) => {
    const now = new Date();
    const start = new Date(show.startTime);
    const end = new Date(show.endTime);
    return now >= start && now <= end;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {showsByStation.map(({ station, shows: stationShows }) => (
        <div key={station._id} style={{ marginBottom: 24 }}>
          {/* Station Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {station.logoUrl && (
              <img
                src={station.logoUrl}
                alt={station.name}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 8,
                  objectFit: "cover",
                }}
              />
            )}
            <div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", color: gold }}>
                {station.name}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: "var(--muted)" }}>
                {stationShows.length} {stationShows.length === 1 ? "show" : "shows"} scheduled
              </p>
            </div>
          </div>

          {/* Shows Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {stationShows.map((show) => {
              const startTime = new Date(show.startTime);
              const endTime = new Date(show.endTime);
              const duration = Math.round((endTime - startTime) / (1000 * 60)); // minutes

              return (
                <div
                  key={show._id}
                  onClick={() => {
                    if (onShowClick) {
                      onShowClick(show);
                    } else if (show._id) {
                      navigate(`/shows/${show._id}`);
                    }
                  }}
                  style={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: 16,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a1a1a";
                    e.currentTarget.style.borderColor = gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#111";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  }}
                >
                  {isLive(show) && (
                    <div
                      style={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        background: "#ef4444",
                        color: "#fff",
                        padding: "4px 8px",
                        borderRadius: 4,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                      }}
                    >
                      LIVE
                    </div>
                  )}

                  {show.thumbnailUrl && (
                    <img
                      src={show.thumbnailUrl}
                      alt={show.title}
                      style={{
                        width: "100%",
                        height: 160,
                        objectFit: "cover",
                        borderRadius: 8,
                        marginBottom: 12,
                      }}
                    />
                  )}

                  <h3
                    style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: "1.1rem",
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  >
                    {show.title}
                  </h3>

                  {show.description && (
                    <p
                      style={{
                        margin: 0,
                        marginBottom: 12,
                        fontSize: 13,
                        color: "var(--muted)",
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {show.description}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      color: "var(--muted)",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: gold }}>
                        {formatDate(show.startTime)} • {formatTime(show.startTime)}
                      </div>
                      <div style={{ fontSize: 11, marginTop: 2 }}>
                        {formatTime(show.endTime)} • {duration} min
                      </div>
                    </div>
                  </div>

                  {show.category && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: "4px 8px",
                        background: "rgba(255,184,77,0.1)",
                        color: gold,
                        borderRadius: 4,
                        fontSize: 11,
                        display: "inline-block",
                      }}
                    >
                      {show.category}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


// frontend/src/components/TalentVoting.jsx
import React, { useState, useEffect } from "react";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5001";
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5001";

export default function TalentVoting({ stationSlug = "texas-got-talent" }) {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState({});
  const socketRef = React.useRef(null);

  useEffect(() => {
    fetchContestants();
    
    // Connect to TGT socket for real-time updates
    try {
      socketRef.current = io(`${SOCKET_URL}/tgt`, {
        transports: ["websocket", "polling"],
        reconnection: true,
      });
      socketRef.current.on("connect", () => {
        console.log("✅ Connected to TGT socket");
      });
      socketRef.current.on("new_tgt_vote", (data) => {
        setContestants((prev) =>
          prev.map((c) => {
            const contestantId = typeof data.contestantId === "string" ? data.contestantId : data.contestantId?.toString();
            const cId = typeof c._id === "string" ? c._id : c._id?.toString();
            return cId === contestantId ? { ...c, totalVotes: data.totalVotes } : c;
          })
        );
      });
      socketRef.current.on("error", (err) => {
        console.warn("TGT socket error:", err);
      });
    } catch (err) {
      console.warn("Failed to connect to TGT socket:", err);
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [stationSlug]);

  const fetchContestants = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tgt/contestants?stationSlug=${stationSlug}`);
      const data = await res.json();
      if (data.ok) {
        setContestants(data.contestants || []);
      }
    } catch (err) {
      console.error("Error fetching contestants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (contestantId) => {
    const idStr = typeof contestantId === "string" ? contestantId : contestantId?.toString();
    if (voting[idStr]) return; // Prevent double voting

    setVoting((prev) => ({ ...prev, [idStr]: true }));
    try {
      const res = await fetch(`${API_BASE}/api/tgt/contestants/${idStr}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localStorage.getItem("userId") || "guest" }),
      });
      const data = await res.json();
      if (data.ok) {
        setContestants((prev) =>
          prev.map((c) => {
            const cId = typeof c._id === "string" ? c._id : c._id?.toString();
            return cId === idStr ? { ...c, totalVotes: data.totalVotes } : c;
          })
        );
      }
    } catch (err) {
      console.error("Error voting:", err);
    } finally {
      setVoting((prev) => ({ ...prev, [idStr]: false }));
    }
  };

  if (loading) {
    return (
      <div className="ps-card">
        <p style={{ textAlign: "center", opacity: 0.7 }}>Loading voting...</p>
      </div>
    );
  }

  if (contestants.length === 0) {
    return (
      <div className="ps-card">
        <h3 style={{ marginBottom: 12 }}>Vote for Your Favorite</h3>
        <p style={{ textAlign: "center", opacity: 0.7 }}>No contestants yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <div className="ps-card">
      <h3 style={{ marginBottom: 16 }}>🗳️ Vote for Your Favorite</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
        }}
      >
        {contestants.map((contestant) => (
          <div
            key={contestant._id}
            style={{
              textAlign: "center",
              padding: 16,
              background: "rgba(255,255,255,0.05)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {contestant.photoUrl && (
              <img
                src={contestant.photoUrl}
                alt={contestant.name}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginBottom: 12,
                }}
              />
            )}
            <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 16 }}>{contestant.name}</div>
            {contestant.bio && (
              <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 8, lineHeight: 1.4, minHeight: 32 }}>
                {contestant.bio.substring(0, 60)}...
              </div>
            )}
            <div
              style={{
                fontSize: 28,
                color: "var(--gold)",
                marginBottom: 4,
                fontWeight: 700,
                textShadow: "0 0 10px rgba(230,184,0,0.5)",
              }}
            >
              {contestant.totalVotes || 0}
            </div>
            <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
              votes
            </div>
            <button
              onClick={() => handleVote(contestant._id)}
              disabled={voting[contestant._id?.toString()]}
              style={{
                width: "100%",
                padding: "10px 16px",
                background: voting[contestant._id?.toString()] ? "rgba(230,184,0,0.5)" : "var(--gold)",
                color: "#000",
                border: "none",
                borderRadius: 8,
                fontWeight: 700,
                cursor: voting[contestant._id?.toString()] ? "not-allowed" : "pointer",
                fontSize: 14,
                transition: "all 0.2s",
                boxShadow: voting[contestant._id?.toString()] ? "none" : "0 4px 12px rgba(230,184,0,0.3)",
              }}
              onMouseEnter={(e) => {
                if (!voting[contestant._id?.toString()]) {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.boxShadow = "0 6px 16px rgba(230,184,0,0.4)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = voting[contestant._id?.toString()] ? "none" : "0 4px 12px rgba(230,184,0,0.3)";
              }}
            >
              {voting[contestant._id?.toString()] ? "⏳ Voting..." : "🗳️ Vote"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


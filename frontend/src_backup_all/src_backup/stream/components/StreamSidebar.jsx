// frontend/src/stream/components/StreamSidebar.js
import React, { useEffect, useState } from "react";

const StreamSidebar = ({ onSelectStream, activeStreamId }) => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const res = await fetch("/api/streams");
        const data = await res.json();
        setStreams(data || []);
      } catch (err) {
        console.error("Error loading streams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStreams();
  }, []);

  return (
    <div style={styles.sidebar}>
      <h3 style={styles.header}>📺 Live Streams</h3>
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : streams.length > 0 ? (
        <ul style={styles.list}>
          {streams.map((stream) => (
            <li
              key={stream._id}
              style={{
                ...styles.item,
                backgroundColor: stream._id === activeStreamId ? "#222" : "transparent"
              }}
              onClick={() => onSelectStream && onSelectStream(stream)}
            >
              <img
                src={stream.thumbnail || "/default-stream-thumbnail.png"}
                alt={stream.title}
                style={styles.thumbnail}
              />
              <div>
                <p style={styles.title}>{stream.title}</p>
                <p style={styles.viewers}>
                  {stream.viewers || 0} viewers
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.empty}>No live streams right now.</p>
      )}
    </div>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    height: "100vh",
    background: "#000",
    color: "#fff",
    borderRight: "1px solid #333",
    padding: "16px",
    overflowY: "auto"
  },
  header: {
    marginBottom: "16px",
    fontSize: "20px",
    fontWeight: "bold"
  },
  loading: {
    fontSize: "14px",
    color: "#aaa"
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "8px",
    transition: "background 0.2s"
  },
  thumbnail: {
    width: "60px",
    height: "40px",
    borderRadius: "4px",
    objectFit: "cover"
  },
  title: {
    fontSize: "14px",
    fontWeight: "bold",
    marginBottom: "2px"
  },
  viewers: {
    fontSize: "12px",
    color: "#bbb"
  },
  empty: {
    fontSize: "14px",
    color: "#aaa"
  }
};

export default StreamSidebar;



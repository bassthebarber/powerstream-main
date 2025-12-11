// frontend/src/nlf-tv/NLFGuide.jsx
// No Limit Forever TV - Program Guide

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import styles from "./styles/NLF.module.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function NLFGuide() {
  const [station, setStation] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch station info
      const stationRes = await fetch(`${API_BASE}/api/nlf/station`);
      const stationData = await stationRes.json();
      if (stationData.success) {
        setStation(stationData.station);
      }

      // Fetch schedule
      const scheduleRes = await fetch(`${API_BASE}/api/nlf/schedule`);
      const scheduleData = await scheduleRes.json();
      if (scheduleData.success) {
        setSchedule(scheduleData.schedule);
      }

      // Fetch events
      const eventsRes = await fetch(`${API_BASE}/api/nlf/events?upcoming=true`);
      const eventsData = await eventsRes.json();
      if (eventsData.success) {
        setEvents(eventsData.events);
      }

      setLoading(false);
    } catch (err) {
      console.error("[NLF] Error fetching guide data:", err);
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getNextDays = (count = 7) => {
    const days = [];
    for (let i = 0; i < count; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const getTypeIcon = (type) => {
    const icons = {
      premiere: "🎬",
      concert: "🎤",
      documentary: "🎥",
      interview: "🎙️",
      live: "🔴",
      rerun: "🔄",
      special: "⭐",
    };
    return icons[type] || "📺";
  };

  if (loading) {
    return (
      <div className={styles.guidePage}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.guidePage}>
      {/* Header */}
      <div className={styles.guideHeader}>
        <Link to="/nlf" style={{ textDecoration: "none" }}>
          <img
            src="/logos/nolimit-forever-logo.png"
            alt="NLF TV"
            style={{ width: "80px", height: "80px", marginBottom: "1rem" }}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/80x80/FFD700/000000?text=NLF";
            }}
          />
        </Link>
        <h1>Program Guide</h1>
        <p style={{ color: "#888" }}>No Limit Forever TV Schedule</p>
        
        {station?.isLive && (
          <div className={styles.liveIndicator} style={{ marginTop: "1rem" }}>
            🔴 LIVE NOW
          </div>
        )}
      </div>

      {/* Date Selector */}
      <div style={{ 
        display: "flex", 
        gap: "1rem", 
        justifyContent: "center",
        flexWrap: "wrap",
        marginBottom: "3rem",
        padding: "0 1rem",
      }}>
        {getNextDays(7).map((date, i) => (
          <button
            key={i}
            onClick={() => setSelectedDate(date)}
            style={{
              background: date.toDateString() === selectedDate.toDateString() 
                ? "linear-gradient(135deg, #FFD700, #B8860B)" 
                : "#1a1a1a",
              color: date.toDateString() === selectedDate.toDateString() ? "#000" : "#fff",
              border: "none",
              padding: "1rem 1.5rem",
              borderRadius: "12px",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
          >
            <div style={{ fontWeight: "600" }}>
              {date.toLocaleDateString("en-US", { weekday: "short" })}
            </div>
            <div style={{ fontSize: "1.5rem" }}>
              {date.getDate()}
            </div>
          </button>
        ))}
      </div>

      {/* Schedule Grid */}
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <h2 className={styles.sectionTitle} style={{ marginBottom: "1.5rem" }}>
          📅 {formatDate(selectedDate)}
        </h2>
        
        <div className={styles.guideGrid}>
          {schedule.length > 0 ? (
            schedule.map((item, index) => (
              <React.Fragment key={index}>
                <div className={styles.guideTimeCol}>
                  {formatTime(item.startTime)}
                </div>
                <div className={styles.guideShowCol}>
                  <h4>
                    {getTypeIcon(item.type)} {item.title}
                  </h4>
                  <p>{item.description}</p>
                  {item.artist && (
                    <p style={{ color: "#FFD700", marginTop: "0.3rem" }}>
                      🎤 {item.artist}
                    </p>
                  )}
                </div>
              </React.Fragment>
            ))
          ) : (
            <>
              <div className={styles.guideTimeCol}>-</div>
              <div className={styles.guideShowCol}>
                <h4>No schedule available</h4>
                <p>Check back later for upcoming shows</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upcoming Events */}
      {events.length > 0 && (
        <div style={{ maxWidth: "1000px", margin: "3rem auto" }}>
          <h2 className={styles.sectionTitle} style={{ marginBottom: "1.5rem" }}>
            🎉 Upcoming Events
          </h2>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {events.map((event, index) => (
              <div
                key={index}
                style={{
                  background: "#1a1a1a",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  borderLeft: "4px solid #FFD700",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ marginBottom: "0.5rem", fontSize: "1.2rem" }}>
                      {event.title}
                    </h4>
                    <p style={{ color: "#888", marginBottom: "0.5rem" }}>
                      {event.description}
                    </p>
                    <div style={{ display: "flex", gap: "1.5rem", color: "#888", fontSize: "0.9rem" }}>
                      <span>📅 {formatDate(event.eventDate)}</span>
                      {event.venue && <span>📍 {event.venue}</span>}
                    </div>
                    {event.artists && event.artists.length > 0 && (
                      <p style={{ color: "#FFD700", marginTop: "0.5rem" }}>
                        🎤 {event.artists.join(", ")}
                      </p>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {event.isVirtual && (
                      <span style={{
                        background: "rgba(123, 44, 191, 0.2)",
                        color: "#7B2CBF",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                      }}>
                        Virtual
                      </span>
                    )}
                    {event.willStream && (
                      <span style={{
                        background: "rgba(255, 215, 0, 0.2)",
                        color: "#FFD700",
                        padding: "0.3rem 0.8rem",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                      }}>
                        Live Stream
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Back Link */}
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <Link to="/nlf" className={styles.btnSecondary}>
          ← Back to NLF TV
        </Link>
      </div>
    </div>
  );
}



// frontend/studio-app/src/pages/SouthernPowerLanding.jsx
// Southern Power Syndicate Gold Landing Page
// Black & Gold Edition - Routes to PowerHarmony internal modules

import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css"; // Gold button styles

// Navigation buttons configuration
const NAV_BUTTONS = [
  { label: "Studio", icon: "🏠", path: "/studio", desc: "PowerHarmony Control Room" },
  { label: "Record", icon: "🎙️", path: "/recordboot", desc: "AI Coach Record Booth" },
  { label: "Mix", icon: "🎚️", path: "/mix", desc: "Mix & Master Suite" },
  { label: "Beat Store", icon: "🎵", path: "/beats", desc: "Browse & License Beats" },
  { label: "Player", icon: "🔊", path: "/player", desc: "Beat Player & Sequencer" },
  { label: "Upload", icon: "⬆️", path: "/upload", desc: "Upload Tracks to Cloud" },
  { label: "Export & Email", icon: "📧", path: "/export", desc: "Export & Send Projects" },
  { label: "Royalty", icon: "💰", path: "/royalty", desc: "Revenue Splits" },
  { label: "Visualizer", icon: "🌈", path: "/visualizer", desc: "Audio Visualization" },
  { label: "Library", icon: "📚", path: "/library", desc: "Your Studio Assets" },
  { label: "Settings", icon: "⚙️", path: "/settings", desc: "Studio Preferences" },
];

export default function SouthernPowerLanding() {
  const navigate = useNavigate();

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title} className="title-reflect">
          Southern Power Syndicate
        </h1>
        <p style={styles.subtitle}>
          AI Recording Studio · Black & Gold Edition
        </p>
        <p style={styles.tagline}>
          No Limit East Houston · Record · Mix · Master · Distribute
        </p>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroIcon}>🎤</div>
          <div>
            <h2 style={styles.heroTitle}>Welcome to the Studio</h2>
            <p style={styles.heroDesc}>
              Full AI-powered production suite. Create, record, mix, and master your tracks.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation Grid */}
      <section style={styles.navSection}>
        <div style={styles.navGrid}>
          {NAV_BUTTONS.map((btn) => (
            <button
              key={btn.path}
              className="button-gold"
              onClick={() => navigate(btn.path)}
              style={styles.navButton}
            >
              <span className="icon" style={styles.buttonIcon}>{btn.icon}</span>
              <span className="label" style={styles.buttonLabel}>{btn.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section style={styles.quickSection}>
        <h3 style={styles.sectionTitle}>Quick Start</h3>
        <div style={styles.quickGrid}>
          <button
            className="button-gold"
            onClick={() => navigate("/recordboot")}
            style={styles.quickButton}
          >
            <span style={styles.quickIcon}>🎙️</span>
            <span style={styles.quickText}>Start Recording</span>
          </button>
          <button
            className="button-gold"
            onClick={() => navigate("/beat-lab")}
            style={styles.quickButton}
          >
            <span style={styles.quickIcon}>🎹</span>
            <span style={styles.quickText}>Generate Beat</span>
          </button>
          <button
            className="button-gold"
            onClick={() => navigate("/studio")}
            style={styles.quickButton}
          >
            <span style={styles.quickIcon}>🎛️</span>
            <span style={styles.quickText}>Open Control Room</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          © {new Date().getFullYear()} Southern Power Syndicate · No Limit East Houston
        </p>
        <p style={styles.footerSub}>
          PowerHarmony AI Recording Studio · Black & Gold Edition
        </p>
      </footer>
    </div>
  );
}

const styles = {
  wrap: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #0a0a0c 0%, #000000 50%, #0a0806 100%)",
    color: "#f5d76e",
    fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    padding: "0",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    textAlign: "center",
    padding: "48px 24px 32px",
    borderBottom: "1px solid rgba(230, 184, 0, 0.15)",
    background: "linear-gradient(180deg, rgba(230, 184, 0, 0.05) 0%, transparent 100%)",
  },
  title: {
    margin: "0 0 12px",
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 900,
    letterSpacing: "-0.02em",
    textTransform: "uppercase",
  },
  subtitle: {
    margin: "0 0 8px",
    fontSize: "1.1rem",
    color: "#e6b800",
    fontWeight: 600,
  },
  tagline: {
    margin: 0,
    fontSize: "0.9rem",
    color: "#888",
    letterSpacing: "0.05em",
  },
  hero: {
    padding: "32px 24px",
    borderBottom: "1px solid rgba(230, 184, 0, 0.1)",
  },
  heroInner: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "24px",
    padding: "24px",
    background: "linear-gradient(135deg, rgba(230, 184, 0, 0.08) 0%, rgba(0, 0, 0, 0.4) 100%)",
    borderRadius: "20px",
    border: "1px solid rgba(230, 184, 0, 0.2)",
  },
  heroIcon: {
    fontSize: "3.5rem",
    flexShrink: 0,
  },
  heroTitle: {
    margin: "0 0 8px",
    fontSize: "1.4rem",
    fontWeight: 800,
    color: "#fff",
  },
  heroDesc: {
    margin: 0,
    fontSize: "0.95rem",
    color: "#aaa",
    lineHeight: 1.5,
  },
  navSection: {
    padding: "40px 24px",
    flex: 1,
  },
  navGrid: {
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "16px",
  },
  navButton: {
    width: "100%",
    minHeight: "70px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
  },
  buttonIcon: {
    fontSize: "1.3rem",
  },
  buttonLabel: {
    fontSize: "1rem",
    fontWeight: 800,
  },
  quickSection: {
    padding: "32px 24px 48px",
    borderTop: "1px solid rgba(230, 184, 0, 0.1)",
    background: "rgba(0, 0, 0, 0.3)",
  },
  sectionTitle: {
    margin: "0 0 24px",
    textAlign: "center",
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#e6b800",
    textTransform: "uppercase",
    letterSpacing: "0.1em",
  },
  quickGrid: {
    maxWidth: "800px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
  },
  quickButton: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  quickIcon: {
    fontSize: "2rem",
  },
  quickText: {
    fontSize: "0.95rem",
    fontWeight: 800,
  },
  footer: {
    textAlign: "center",
    padding: "24px",
    borderTop: "1px solid rgba(230, 184, 0, 0.1)",
    background: "rgba(0, 0, 0, 0.5)",
  },
  footerText: {
    margin: "0 0 4px",
    fontSize: "0.85rem",
    color: "#666",
  },
  footerSub: {
    margin: 0,
    fontSize: "0.75rem",
    color: "#444",
  },
};















// frontend/studio-app/src/components/ui/TopNav.jsx
// Top Navigation for PowerHarmony Studio
// IMPORTANT: Do not change visual design, colors, or layout

import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./TopNav.css";

// Navigation items matching the user's exact button labels
const navItems = [
  { to: "/", label: "🏠 Home", icon: "home" },
  { to: "/studio", label: "🎛️ Studio", icon: "studio" },
  { to: "/recordboot", label: "🎙 Record", icon: "mic" },
  { to: "/mix", label: "🎚 Mix", icon: "mix" },
  { to: "/beats", label: "🎵 Beat Store", icon: "store" },
  { to: "/player", label: "▶ Player", icon: "play" },
  { to: "/upload", label: "⬆ Upload", icon: "upload" },
  { to: "/export", label: "📤 Export & Email", icon: "export" },
  { to: "/royalty", label: "💰 Royalty", icon: "money" },
  { to: "/visualizer", label: "🌈 Visualizer", icon: "visual" },
  { to: "/library", label: "📚 Library", icon: "library" },
  { to: "/settings", label: "⚙ Settings", icon: "settings" },
];

export default function TopNav() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check if current path matches nav item
  const isActive = (to) => {
    if (to === "/") return pathname === "/";
    if (to === "/studio") return pathname === "/studio";
    if (to === "/recordboot") return pathname === "/recordboot" || pathname === "/record-booth" || pathname === "/record";
    if (to === "/beats") return pathname === "/beats" || pathname === "/beat-store";
    return pathname.startsWith(to);
  };

  return (
    <nav className="studio-nav">
      {/* Brand / Logo - Goes to Southern Power Landing (Home) */}
      <div className="studio-nav-brand">
        <Link to="/" className="studio-nav-logo">
          <span className="studio-nav-logo-icon">🎤</span>
          <span className="studio-nav-logo-text">Southern Power</span>
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button 
        className="studio-nav-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
      >
        <span className="studio-nav-toggle-bar"></span>
        <span className="studio-nav-toggle-bar"></span>
        <span className="studio-nav-toggle-bar"></span>
      </button>

      {/* Nav Links */}
      <div className={`studio-nav-links ${mobileOpen ? "studio-nav-links--open" : ""}`}>
        {navItems.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`studio-nav-link ${isActive(to) ? "studio-nav-link--active" : ""}`}
            onClick={() => setMobileOpen(false)}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Status Indicator */}
      <div className="studio-nav-status">
        <span className="studio-nav-status-dot"></span>
        <span className="studio-nav-status-text">Studio Online</span>
      </div>
    </nav>
  );
}

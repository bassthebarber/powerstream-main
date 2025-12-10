// frontend/src/components/layout/SideBar.jsx
// Global sidebar navigation per Overlord Spec
import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./layout.css";

const NAV_ITEMS = [
  { path: "/", label: "Home", icon: "🏠" },
  { path: "/powerfeed", label: "PowerFeed", icon: "📰" },
  { path: "/powergram", label: "PowerGram", icon: "📸" },
  { path: "/powerreel", label: "PowerReel", icon: "🎬" },
  { path: "/powerline", label: "PowerLine", icon: "💬", requireAuth: true },
  { path: "/tv-guide", label: "TV Guide", icon: "📺" },
  { divider: true },
  { path: "/southern-power", label: "Southern Power", icon: "⚡" },
  { path: "/NoLimitEastHouston", label: "No Limit East Houston", icon: "🎵" },
  { path: "/civic-connect", label: "Civic Connect", icon: "🏛️" },
  { path: "/texas-got-talent", label: "Texas Got Talent", icon: "⭐" },
  { divider: true },
  { path: "/audio", label: "Audio", icon: "🎧" },
  { path: "/video", label: "Video", icon: "🎥" },
  { path: "/studio", label: "Studio", icon: "🎛️", requireAuth: true },
  { divider: true },
  { path: "/support", label: "Support", icon: "❓" },
];

export default function SideBar() {
  const { user } = useAuth();
  
  return (
    <aside className="ps-sidebar">
      <nav className="ps-sidebar-nav">
        {NAV_ITEMS.map((item, idx) => {
          if (item.divider) {
            return <div key={idx} className="ps-sidebar-divider" />;
          }
          
          if (item.requireAuth && !user) {
            return null;
          }
          
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `ps-sidebar-link ${isActive ? "ps-sidebar-link--active" : ""}`
              }
            >
              <span className="ps-sidebar-icon">{item.icon}</span>
              <span className="ps-sidebar-label">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}


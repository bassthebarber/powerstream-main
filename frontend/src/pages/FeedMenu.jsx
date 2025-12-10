import React from "react";
import MenuGridItem from "../components/MenuGridItem.jsx";

const gold = "#ffb84d";

const menuItems = [
  { icon: "👤", label: "Profile", path: "/feed/profile" },
  { icon: "👥", label: "Friends", path: "/feed/friends" },
  { icon: "📰", label: "Feeds", path: "/powerfeed" },
  { icon: "👨‍👩‍👧‍👦", label: "Groups", path: "/feed/groups" },
  { icon: "🛒", label: "Marketplace", path: "/feed/marketplace" },
  { icon: "🎬", label: "Reels", path: "/powerreel" },
  { icon: "📸", label: "PowerGram", path: "/powergram" },
  { icon: "💬", label: "PowerLine", path: "/powerline" },
  { icon: "🕰️", label: "Memories", path: "/feed/memories" },
  { icon: "💾", label: "Saved", path: "/feed/saved" },
  { icon: "🎉", label: "Events", path: "/feed/events" },
  { icon: "🎮", label: "Games", path: "/feed/games" },
  { icon: "📺", label: "Watch", path: "/feed/watch" },
  { icon: "📚", label: "Pages", path: "/feed/pages" },
  { icon: "💼", label: "Jobs", path: "/feed/jobs" },
  { icon: "📞", label: "Support", path: "/feed/support" },
  { icon: "⚙️", label: "Settings", path: "/feed/settings" },
  { icon: "📊", label: "Analytics", path: "/feed/analytics" },
];

export default function FeedMenu() {
  return (
    <div className="ps-page" style={{ paddingBottom: 80 }}>
      <header style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 900,
            marginBottom: 8,
            background: `linear-gradient(90deg, ${gold}, #ffda5c)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          PowerFeed Menu
        </h1>
        <p style={{ color: "#888", fontSize: "0.95rem" }}>
          Explore all PowerFeed features and sections
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
          gap: 16,
          maxWidth: 1200,
        }}
      >
        {menuItems.map((item, idx) => (
          <MenuGridItem
            key={idx}
            icon={item.icon}
            label={item.label}
            path={item.path}
          />
        ))}
      </div>
    </div>
  );
}




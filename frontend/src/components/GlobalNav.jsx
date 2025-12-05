// frontend/src/components/GlobalNav.jsx
// Global Navigation Bar Component
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { clearToken } from "../utils/auth.js";

export default function GlobalNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Don't show nav on home page
  if (location.pathname === "/") {
    return null;
  }

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      clearToken();
      navigate("/");
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const navItems = [
    { path: "/", label: "🏠 Home", icon: "🏠" },
    { path: "/powerfeed", label: "📱 Feed", icon: "📱" },
    { path: "/powergram", label: "📸 Gram", icon: "📸" },
    { path: "/powerreel", label: "🎬 Reel", icon: "🎬" },
    { path: "/powerline", label: "💬 Line", icon: "💬" },
    { path: "/tv-stations", label: "📺 TV", icon: "📺" },
    { path: "/southern-power", label: "🌐 SPS", icon: "🌐" },
    { path: "/ps-tv", label: "🎥 PS TV", icon: "🎥" },
    { path: "/powerharmony/master", label: "🎛️ Studio", icon: "🎛️" },
    { path: "/multistream", label: "🌐 Multistream", icon: "🌐" },
  ];

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    : user?.email?.[0]?.toUpperCase() || "G";

  return (
    <nav className="ps-global-nav">
      <div className="ps-nav-container">
        {/* Left: Logo */}
        <Link to="/" className="ps-nav-logo">
          <img
            src="/logos/powerstream-logo.png"
            alt="PowerStream"
            style={{ height: "32px", width: "auto" }}
          />
          <span>PowerStream</span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="ps-nav-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`ps-nav-link ${
                location.pathname === item.path ? "ps-nav-link--active" : ""
              }`}
            >
              <span>{item.icon}</span>
              <span className="ps-nav-link-text">{item.label.replace(/^[^\s]+\s/, "")}</span>
            </Link>
          ))}
        </div>

        {/* Right: Search + User Menu */}
        <div className="ps-nav-right">
          <div className="ps-nav-search">
            <input
              type="text"
              placeholder="Search PowerStream..."
              className="ps-nav-search-input"
            />
          </div>
          <div className="ps-nav-user">
            <div className="ps-nav-avatar">{userInitials}</div>
            {user && (
              <div className="ps-nav-user-menu">
                <div className="ps-nav-user-name">{user.name || user.email}</div>
                <button onClick={handleSignOut} className="ps-nav-signout">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


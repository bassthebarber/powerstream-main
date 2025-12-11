// frontend/src/pages/menu/ProfilePage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  // User info
  const displayName = user?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const username = `@${displayName.toLowerCase().replace(/\s/g, "")}`;
  const bio = user?.bio || "PowerStream creator | Music enthusiast 🎵";
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  const stats = {
    posts: 42,
    followers: user?.followers?.length || 1234,
    following: user?.following?.length || 567,
  };

  const tabs = [
    { id: "posts", label: "Posts", icon: "📱" },
    { id: "reels", label: "Reels", icon: "🎬" },
    { id: "grams", label: "Grams", icon: "📸" },
    { id: "liked", label: "Liked", icon: "❤️" },
  ];

  return (
    <MenuPageLayout
      icon="👤"
      title="Profile"
      subtitle={username}
    >
      <div className="profile-header">
        <div className="profile-cover"></div>
        <div className="profile-info">
          <div className="profile-avatar-wrapper">
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="profile-avatar" />
            ) : (
              <div className="profile-avatar profile-avatar--initials">{initials}</div>
            )}
            <button className="profile-avatar-edit">📷</button>
          </div>
          <div className="profile-details">
            <h2>{displayName}</h2>
            <p className="profile-username">{username}</p>
            <p className="profile-bio">{bio}</p>
            <div className="profile-stats">
              <div className="profile-stat">
                <span className="profile-stat-value">{stats.posts}</span>
                <span className="profile-stat-label">Posts</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{stats.followers.toLocaleString()}</span>
                <span className="profile-stat-label">Followers</span>
              </div>
              <div className="profile-stat">
                <span className="profile-stat-value">{stats.following.toLocaleString()}</span>
                <span className="profile-stat-label">Following</span>
              </div>
            </div>
            <div className="profile-actions">
              <button className="ps-menu-btn ps-menu-btn--primary" onClick={() => navigate("/feed/settings")}>
                Edit Profile
              </button>
              <button className="ps-menu-btn ps-menu-btn--secondary" onClick={() => navigate("/feed/analytics")}>
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`profile-tab ${activeTab === tab.id ? "profile-tab--active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="profile-content">
        {activeTab === "posts" && (
          <div className="profile-grid">
            {[1,2,3,4,5,6].map((i) => (
              <div key={i} className="profile-grid-item">
                <div className="profile-grid-placeholder">📝</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "reels" && (
          <div className="profile-grid profile-grid--reels">
            {[1,2,3].map((i) => (
              <div key={i} className="profile-grid-item profile-grid-item--reel">
                <div className="profile-grid-placeholder">🎬</div>
                <span className="profile-reel-views">1.2K</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "grams" && (
          <div className="profile-grid">
            {[1,2,3,4].map((i) => (
              <div key={i} className="profile-grid-item">
                <div className="profile-grid-placeholder">📸</div>
              </div>
            ))}
          </div>
        )}
        {activeTab === "liked" && (
          <div className="profile-empty">
            <span>❤️</span>
            <p>Liked content will appear here</p>
          </div>
        )}
      </div>

      <style>{`
        .profile-header {
          position: relative;
          margin-bottom: 24px;
        }

        .profile-cover {
          height: 160px;
          background: linear-gradient(135deg, rgba(230,184,0,0.2), rgba(230,184,0,0.05));
          border-radius: 16px;
        }

        .profile-info {
          display: flex;
          gap: 24px;
          padding: 0 24px;
          margin-top: -50px;
          position: relative;
        }

        @media (max-width: 640px) {
          .profile-info {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }

        .profile-avatar-wrapper {
          position: relative;
        }

        .profile-avatar {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          border: 4px solid #000;
          object-fit: cover;
          background: linear-gradient(135deg, var(--gold), #ffda5c);
        }

        .profile-avatar--initials {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          font-weight: 800;
          color: #000;
        }

        .profile-avatar-edit {
          position: absolute;
          bottom: 4px;
          right: 4px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--gold);
          border: 2px solid #000;
          font-size: 14px;
          cursor: pointer;
        }

        .profile-details {
          flex: 1;
          padding-top: 60px;
        }

        @media (max-width: 640px) {
          .profile-details {
            padding-top: 16px;
          }
        }

        .profile-details h2 {
          font-size: 24px;
          font-weight: 800;
          margin: 0 0 4px 0;
        }

        .profile-username {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 12px 0;
        }

        .profile-bio {
          font-size: 14px;
          color: var(--text);
          margin: 0 0 16px 0;
        }

        .profile-stats {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .profile-stats {
            justify-content: center;
          }
        }

        .profile-stat {
          text-align: center;
        }

        .profile-stat-value {
          display: block;
          font-size: 18px;
          font-weight: 700;
        }

        .profile-stat-label {
          font-size: 12px;
          color: var(--muted);
        }

        .profile-actions {
          display: flex;
          gap: 12px;
        }

        @media (max-width: 640px) {
          .profile-actions {
            justify-content: center;
          }
        }

        .profile-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 24px;
        }

        .profile-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: transparent;
          border: none;
          border-bottom: 2px solid transparent;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .profile-tab:hover {
          color: #fff;
        }

        .profile-tab--active {
          color: var(--gold);
          border-bottom-color: var(--gold);
        }

        .profile-content {
          min-height: 200px;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
        }

        .profile-grid--reels {
          grid-template-columns: repeat(3, 1fr);
        }

        .profile-grid-item {
          aspect-ratio: 1;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          position: relative;
        }

        .profile-grid-item--reel {
          aspect-ratio: 9/16;
        }

        .profile-grid-item:hover {
          opacity: 0.8;
        }

        .profile-grid-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          opacity: 0.3;
        }

        .profile-reel-views {
          position: absolute;
          bottom: 8px;
          left: 8px;
          font-size: 12px;
          color: #fff;
        }

        .profile-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .profile-empty span {
          font-size: 48px;
          display: block;
          margin-bottom: 16px;
          opacity: 0.5;
        }
      `}</style>
    </MenuPageLayout>
  );
}



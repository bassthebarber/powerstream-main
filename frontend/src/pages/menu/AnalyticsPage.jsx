// frontend/src/pages/menu/AnalyticsPage.jsx
import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function AnalyticsPage() {
  const { user } = useAuth();

  // Mock analytics data
  const stats = {
    followers: user?.followers?.length || 1234,
    following: user?.following?.length || 567,
    posts: 42,
    reels: 18,
    totalViews: 45678,
    totalLikes: 8901,
    coins: user?.coinBalance || 2500,
  };

  const recentPerformance = [
    { label: "This Week", views: 1234, likes: 89, followers: "+12" },
    { label: "Last Week", views: 987, likes: 76, followers: "+8" },
    { label: "Last Month", views: 4521, likes: 312, followers: "+45" },
  ];

  const topContent = [
    { title: "Studio Session Live", type: "reel", views: 2340, likes: 189 },
    { title: "New Track Preview", type: "post", views: 1890, likes: 156 },
    { title: "Behind the Beats", type: "reel", views: 1567, likes: 134 },
  ];

  return (
    <MenuPageLayout
      icon="📊"
      title="Analytics"
      subtitle="Track your performance on PowerStream"
    >
      <div className="analytics-overview">
        <div className="stat-card stat-card--large">
          <span className="stat-value">{stats.followers.toLocaleString()}</span>
          <span className="stat-label">Followers</span>
        </div>
        <div className="stat-card stat-card--large">
          <span className="stat-value">{stats.totalViews.toLocaleString()}</span>
          <span className="stat-label">Total Views</span>
        </div>
        <div className="stat-card stat-card--large">
          <span className="stat-value">{stats.totalLikes.toLocaleString()}</span>
          <span className="stat-label">Total Likes</span>
        </div>
        <div className="stat-card stat-card--coins">
          <span className="stat-value">⚡ {stats.coins.toLocaleString()}</span>
          <span className="stat-label">PowerCoins</span>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-section">
          <h3>Content Stats</h3>
          <div className="content-stats">
            <div className="content-stat">
              <span className="content-stat-icon">📱</span>
              <span className="content-stat-value">{stats.posts}</span>
              <span className="content-stat-label">Posts</span>
            </div>
            <div className="content-stat">
              <span className="content-stat-icon">🎬</span>
              <span className="content-stat-value">{stats.reels}</span>
              <span className="content-stat-label">Reels</span>
            </div>
            <div className="content-stat">
              <span className="content-stat-icon">👥</span>
              <span className="content-stat-value">{stats.following}</span>
              <span className="content-stat-label">Following</span>
            </div>
          </div>
        </div>

        <div className="analytics-section">
          <h3>Recent Performance</h3>
          <div className="performance-table">
            {recentPerformance.map((period, idx) => (
              <div key={idx} className="performance-row">
                <span className="performance-period">{period.label}</span>
                <span className="performance-stat">👁️ {period.views}</span>
                <span className="performance-stat">❤️ {period.likes}</span>
                <span className="performance-stat performance-stat--positive">{period.followers}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="analytics-section analytics-section--full">
        <h3>Top Performing Content</h3>
        <div className="top-content-list">
          {topContent.map((content, idx) => (
            <div key={idx} className="top-content-item">
              <span className="top-content-rank">#{idx + 1}</span>
              <div className="top-content-info">
                <h4>{content.title}</h4>
                <span className="top-content-type">{content.type}</span>
              </div>
              <div className="top-content-stats">
                <span>👁️ {content.views.toLocaleString()}</span>
                <span>❤️ {content.likes.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .analytics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .stat-card--large .stat-value {
          font-size: 32px;
          font-weight: 800;
          display: block;
          margin-bottom: 8px;
        }

        .stat-card--coins {
          background: linear-gradient(135deg, rgba(230,184,0,0.15), rgba(230,184,0,0.05));
          border-color: rgba(230,184,0,0.2);
        }

        .stat-card--coins .stat-value {
          color: var(--gold);
        }

        .stat-label {
          font-size: 14px;
          color: var(--muted);
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .analytics-section {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
        }

        .analytics-section h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--gold);
        }

        .analytics-section--full {
          grid-column: 1 / -1;
        }

        .content-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .content-stat {
          text-align: center;
          padding: 16px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
        }

        .content-stat-icon {
          display: block;
          font-size: 24px;
          margin-bottom: 8px;
        }

        .content-stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .content-stat-label {
          font-size: 12px;
          color: var(--muted);
        }

        .performance-table {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .performance-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px;
          background: rgba(0,0,0,0.2);
          border-radius: 8px;
        }

        .performance-period {
          min-width: 100px;
          font-weight: 600;
        }

        .performance-stat {
          font-size: 14px;
          color: var(--muted);
        }

        .performance-stat--positive {
          color: #4ade80;
        }

        .top-content-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .top-content-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
        }

        .top-content-rank {
          font-size: 20px;
          font-weight: 800;
          color: var(--gold);
          min-width: 40px;
        }

        .top-content-info {
          flex: 1;
        }

        .top-content-info h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .top-content-type {
          font-size: 12px;
          color: var(--muted);
          text-transform: capitalize;
        }

        .top-content-stats {
          display: flex;
          gap: 16px;
          font-size: 14px;
          color: var(--muted);
        }
      `}</style>
    </MenuPageLayout>
  );
}




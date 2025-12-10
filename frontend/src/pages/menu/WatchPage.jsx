// frontend/src/pages/menu/WatchPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function WatchPage() {
  const navigate = useNavigate();

  const watchCategories = [
    { id: 1, name: "Live TV Stations", icon: "📺", path: "/tv-stations", count: "10+ channels" },
    { id: 2, name: "PowerStream TV", icon: "🎬", path: "/powerstream-tv", count: "Movies & Shows" },
    { id: 3, name: "PowerReel", icon: "🎞️", path: "/powerreel", count: "Short videos" },
    { id: 4, name: "World TV", icon: "🌍", path: "/world-tv", count: "International" },
  ];

  const trendingVideos = [
    { id: 1, title: "Studio Session Live", views: "12K", thumbnail: "🎙️" },
    { id: 2, title: "Beat Making Tutorial", views: "8.5K", thumbnail: "🎹" },
    { id: 3, title: "Artist Interview", views: "5.2K", thumbnail: "🎤" },
  ];

  return (
    <MenuPageLayout
      icon="📺"
      title="Watch"
      subtitle="TV, videos, and live streams"
    >
      <h3 className="watch-section-title">Browse</h3>
      <div className="watch-categories">
        {watchCategories.map((cat) => (
          <div 
            key={cat.id} 
            className="watch-category"
            onClick={() => navigate(cat.path)}
          >
            <span className="watch-category-icon">{cat.icon}</span>
            <div>
              <h4>{cat.name}</h4>
              <span>{cat.count}</span>
            </div>
          </div>
        ))}
      </div>

      <h3 className="watch-section-title">Trending Now</h3>
      <div className="ps-menu-grid">
        {trendingVideos.map((video) => (
          <div key={video.id} className="watch-video-card">
            <div className="watch-video-thumbnail">{video.thumbnail}</div>
            <div className="watch-video-info">
              <h4>{video.title}</h4>
              <span>{video.views} views</span>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .watch-section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--gold);
        }

        .watch-categories {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }

        .watch-category {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .watch-category:hover {
          border-color: rgba(230,184,0,0.3);
          transform: translateY(-2px);
        }

        .watch-category-icon {
          font-size: 32px;
        }

        .watch-category h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .watch-category span {
          font-size: 12px;
          color: var(--muted);
        }

        .watch-video-card {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .watch-video-card:hover {
          border-color: rgba(230,184,0,0.3);
        }

        .watch-video-thumbnail {
          height: 120px;
          background: linear-gradient(135deg, rgba(230,184,0,0.1), rgba(0,0,0,0.3));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .watch-video-info {
          padding: 12px;
        }

        .watch-video-info h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .watch-video-info span {
          font-size: 12px;
          color: var(--muted);
        }
      `}</style>
    </MenuPageLayout>
  );
}




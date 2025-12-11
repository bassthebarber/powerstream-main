// frontend/src/pages/menu/SavedPage.jsx
import React, { useState, useEffect } from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";
import api from "../../lib/api.js";

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = async () => {
    try {
      const res = await api.get("/users/saved").catch(() => ({ data: { items: [] } }));
      setSaved(res.data?.items || res.data?.saved || []);
    } catch (err) {
      console.log("Saved API not available");
    } finally {
      setLoading(false);
    }
  };

  const mockSaved = [
    { id: 1, type: "post", title: "New Music Friday", author: "PowerStream", savedAt: "2 hours ago" },
    { id: 2, type: "reel", title: "Studio Tips", author: "Mix Master", savedAt: "1 day ago" },
    { id: 3, type: "beat", title: "Dark Trap Beat", author: "Studio Pro", savedAt: "3 days ago" },
  ];

  const displaySaved = saved.length > 0 ? saved : mockSaved;

  return (
    <MenuPageLayout
      icon="💾"
      title="Saved"
      subtitle="Content you've saved for later"
    >
      <div className="saved-filters">
        {["all", "posts", "reels", "beats"].map((f) => (
          <button
            key={f}
            className={`saved-filter ${filter === f ? "saved-filter--active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="ps-menu-empty">Loading...</div>
      ) : displaySaved.length === 0 ? (
        <div className="ps-menu-empty">
          <div className="ps-menu-empty-icon">💾</div>
          <h3>Nothing saved yet</h3>
          <p>Save posts, reels, and beats to view them later</p>
        </div>
      ) : (
        <div className="ps-menu-list">
          {displaySaved.map((item) => (
            <div key={item.id || item._id} className="ps-menu-list-item">
              <div className="saved-item-icon">
                {item.type === "post" ? "📝" : item.type === "reel" ? "🎬" : "🎵"}
              </div>
              <div className="saved-item-info">
                <h3>{item.title}</h3>
                <p>by {item.author} • Saved {item.savedAt}</p>
              </div>
              <button className="ps-menu-btn ps-menu-btn--secondary">View</button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .saved-filters {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .saved-filter {
          padding: 8px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: var(--muted);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .saved-filter:hover {
          background: rgba(255,255,255,0.08);
        }

        .saved-filter--active {
          background: var(--gold);
          border-color: var(--gold);
          color: #000;
        }

        .saved-item-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(230,184,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .saved-item-info {
          flex: 1;
        }

        .saved-item-info h3 {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .saved-item-info p {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
        }
      `}</style>
    </MenuPageLayout>
  );
}



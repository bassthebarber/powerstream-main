// frontend/src/pages/menu/MemoriesPage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function MemoriesPage() {
  const mockMemories = [
    { id: 1, date: "1 year ago", title: "First Studio Session", image: "🎙️", type: "post" },
    { id: 2, date: "2 years ago", title: "Hit 1000 Followers", image: "🎉", type: "milestone" },
    { id: 3, date: "3 years ago", title: "Joined PowerStream", image: "⚡", type: "milestone" },
  ];

  return (
    <MenuPageLayout
      icon="📸"
      title="Memories"
      subtitle="Look back at moments from your journey"
    >
      {mockMemories.length === 0 ? (
        <div className="ps-menu-empty">
          <div className="ps-menu-empty-icon">📸</div>
          <h3>No memories yet</h3>
          <p>Your memories will appear here as you use PowerStream</p>
        </div>
      ) : (
        <div className="memories-timeline">
          {mockMemories.map((memory) => (
            <div key={memory.id} className="memory-card">
              <div className="memory-date">{memory.date}</div>
              <div className="memory-content">
                <div className="memory-icon">{memory.image}</div>
                <div className="memory-info">
                  <h3>{memory.title}</h3>
                  <span className="memory-type">{memory.type}</span>
                </div>
              </div>
              <button className="ps-menu-btn ps-menu-btn--secondary">View</button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .memories-timeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .memory-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
        }

        .memory-date {
          min-width: 100px;
          font-size: 14px;
          color: var(--gold);
          font-weight: 600;
        }

        .memory-content {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
        }

        .memory-icon {
          width: 56px;
          height: 56px;
          border-radius: 12px;
          background: rgba(230,184,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .memory-info h3 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 4px 0;
        }

        .memory-type {
          font-size: 12px;
          color: var(--muted);
          text-transform: capitalize;
        }
      `}</style>
    </MenuPageLayout>
  );
}



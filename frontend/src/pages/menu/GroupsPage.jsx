// frontend/src/pages/menu/GroupsPage.jsx
import React, { useState } from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function GroupsPage() {
  const [tab, setTab] = useState("your");

  const mockGroups = [
    { id: 1, name: "Houston Hip-Hop Producers", members: 2340, icon: "🎹", joined: true },
    { id: 2, name: "PowerStream Artists", members: 5621, icon: "🎤", joined: true },
    { id: 3, name: "Texas Got Talent Community", members: 890, icon: "⭐", joined: false },
    { id: 4, name: "Beat Makers United", members: 3210, icon: "🥁", joined: false },
    { id: 5, name: "Music Video Directors", members: 456, icon: "🎬", joined: false },
  ];

  const yourGroups = mockGroups.filter(g => g.joined);
  const discoverGroups = mockGroups.filter(g => !g.joined);

  return (
    <MenuPageLayout
      icon="👨‍👩‍👧‍👦"
      title="Groups"
      subtitle="Connect with communities on PowerStream"
    >
      <div className="groups-tabs">
        <button 
          className={`groups-tab ${tab === "your" ? "groups-tab--active" : ""}`}
          onClick={() => setTab("your")}
        >
          Your Groups
        </button>
        <button 
          className={`groups-tab ${tab === "discover" ? "groups-tab--active" : ""}`}
          onClick={() => setTab("discover")}
        >
          Discover
        </button>
      </div>

      <div className="ps-menu-grid">
        {(tab === "your" ? yourGroups : discoverGroups).map((group) => (
          <div key={group.id} className="ps-menu-card">
            <div className="ps-menu-card-header">
              <div className="ps-menu-card-icon">{group.icon}</div>
              <div>
                <h3 className="ps-menu-card-title">{group.name}</h3>
                <p className="ps-menu-card-meta">{group.members.toLocaleString()} members</p>
              </div>
            </div>
            <div className="ps-menu-card-footer">
              {group.joined ? (
                <button className="ps-menu-btn ps-menu-btn--primary">View Group</button>
              ) : (
                <button className="ps-menu-btn ps-menu-btn--primary">Join Group</button>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .groups-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
        }

        .groups-tab {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .groups-tab:hover {
          background: rgba(255,255,255,0.08);
        }

        .groups-tab--active {
          background: var(--gold);
          border-color: var(--gold);
          color: #000;
        }
      `}</style>
    </MenuPageLayout>
  );
}



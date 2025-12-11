import React from "react";

const suggestions = [
  { id: 1, name: "No Limit East Houston", subtitle: "Label • Houston" },
  { id: 2, name: "Southern Power Network", subtitle: "TV • Syndicate" },
  { id: 3, name: "Studio Producers", subtitle: "Group • Beat Makers" },
];

export default function PeopleYouMayKnow() {
  return (
    <div className="ps-card">
      <h3 className="pf-widget-title">People You May Know</h3>
      <div className="pf-artists-list">
        {suggestions.map((s) => (
          <div key={s.id} className="pf-artist-item">
            <div className="pf-artist-info">
              <div className="pf-avatar pf-artist-avatar">
                {s.name[0]?.toUpperCase()}
              </div>
              <div>
                <div className="pf-artist-name">{s.name}</div>
                <div className="pf-artist-meta">{s.subtitle}</div>
              </div>
            </div>
            <button type="button" className="pf-follow-btn">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}







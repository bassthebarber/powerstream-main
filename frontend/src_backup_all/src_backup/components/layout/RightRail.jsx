import React from "react";

const contacts = [
  { id: "c1", name: "Aria", online: true },
  { id: "c2", name: "Diego", online: false },
  { id: "c3", name: "Sam", online: true },
  { id: "c4", name: "Lina", online: true },
  { id: "c5", name: "Theo", online: false },
];

const trends = [
  { id: "t1", title: "PowerStream 1.0 Launch", meta: "Trending • 12k" },
  { id: "t2", title: "Creator Studio", meta: "Suggested • 2.1k" },
];

export default function RightRail() {
  return (
    <aside className="right-rail">
      <div style={{ position: "sticky", top: 16, display: "grid", gap: 16 }}>
        <div className="card">
          <div style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 10 }}>Sponsored</div>
          <div className="tile thumb" style={{ height: 120 }}>Ad Slot</div>
          <p className="sub" style={{ marginTop: 8 }}>Reach creators on PowerStream.</p>
          <button className="gold-btn" style={{ marginTop: 10 }}>Create Ad</button>
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 10 }}>Contacts</div>
          <div style={{ display: "grid", gap: 8 }}>
            {contacts.map((c) => (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 10, height: 10, borderRadius: 999,
                    background: c.online ? "#30d158" : "#555",
                    boxShadow: c.online ? "0 0 0 3px rgba(48,209,88,.18)" : "none",
                  }}
                  title={c.online ? "Online" : "Offline"}
                />
                <div>{c.name}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 800, color: "var(--gold)", marginBottom: 10 }}>Trends</div>
          <div style={{ display: "grid", gap: 8 }}>
            {trends.map((t) => (
              <div key={t.id}>
                <div style={{ fontWeight: 700 }}>{t.title}</div>
                <div className="sub">{t.meta}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}



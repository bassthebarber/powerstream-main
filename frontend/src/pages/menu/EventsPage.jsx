// frontend/src/pages/menu/EventsPage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function EventsPage() {
  const mockEvents = [
    { id: 1, name: "PowerStream Live Session", date: "Dec 15, 2024", time: "8:00 PM CST", attendees: 156, icon: "🎤" },
    { id: 2, name: "Beat Battle Championship", date: "Dec 20, 2024", time: "7:00 PM CST", attendees: 89, icon: "🥊" },
    { id: 3, name: "Studio Open Mic Night", date: "Dec 22, 2024", time: "9:00 PM CST", attendees: 234, icon: "🎙️" },
    { id: 4, name: "New Year's Eve Party", date: "Dec 31, 2024", time: "10:00 PM CST", attendees: 512, icon: "🎉" },
  ];

  return (
    <MenuPageLayout
      icon="🎉"
      title="Events"
      subtitle="Discover live events and shows"
    >
      <div className="events-grid">
        {mockEvents.map((event) => (
          <div key={event.id} className="event-card">
            <div className="event-header">
              <div className="event-icon">{event.icon}</div>
              <div className="event-date-badge">
                <span className="event-day">{event.date.split(",")[0].split(" ")[1]}</span>
                <span className="event-month">{event.date.split(",")[0].split(" ")[0].slice(0, 3)}</span>
              </div>
            </div>
            <div className="event-info">
              <h3>{event.name}</h3>
              <p className="event-time">{event.date} at {event.time}</p>
              <p className="event-attendees">👥 {event.attendees} interested</p>
            </div>
            <div className="event-actions">
              <button className="ps-menu-btn ps-menu-btn--primary">Interested</button>
              <button className="ps-menu-btn ps-menu-btn--secondary">Share</button>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .events-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .event-card {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.2s ease;
        }

        .event-card:hover {
          border-color: rgba(230,184,0,0.3);
          transform: translateY(-2px);
        }

        .event-header {
          height: 100px;
          background: linear-gradient(135deg, rgba(230,184,0,0.15), rgba(230,184,0,0.05));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .event-icon {
          font-size: 48px;
        }

        .event-date-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          background: var(--gold);
          color: #000;
          padding: 8px 12px;
          border-radius: 8px;
          text-align: center;
        }

        .event-day {
          display: block;
          font-size: 20px;
          font-weight: 800;
          line-height: 1;
        }

        .event-month {
          display: block;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .event-info {
          padding: 16px;
        }

        .event-info h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .event-time {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 8px 0;
        }

        .event-attendees {
          font-size: 13px;
          color: var(--gold);
          margin: 0;
        }

        .event-actions {
          padding: 0 16px 16px;
          display: flex;
          gap: 8px;
        }
      `}</style>
    </MenuPageLayout>
  );
}



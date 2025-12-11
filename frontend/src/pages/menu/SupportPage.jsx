// frontend/src/pages/menu/SupportPage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function SupportPage() {
  const helpTopics = [
    { id: 1, icon: "🔐", title: "Account & Login", description: "Password reset, login issues, account security" },
    { id: 2, icon: "💳", title: "Payments & Coins", description: "Billing, purchases, PowerCoins" },
    { id: 3, icon: "🎛️", title: "Studio & Recording", description: "Audio issues, exports, mixing help" },
    { id: 4, icon: "📺", title: "TV & Streaming", description: "Live streams, video playback" },
    { id: 5, icon: "🚫", title: "Report a Problem", description: "Bug reports, content issues" },
    { id: 6, icon: "💬", title: "Contact Support", description: "Get help from our team" },
  ];

  return (
    <MenuPageLayout
      icon="📞"
      title="Help & Support"
      subtitle="Get help with PowerStream"
    >
      <div className="support-search">
        <input 
          type="text" 
          placeholder="Search help articles..." 
          className="support-search-input"
        />
      </div>

      <h3 className="support-section-title">Help Topics</h3>
      <div className="ps-menu-grid">
        {helpTopics.map((topic) => (
          <div key={topic.id} className="support-topic">
            <div className="support-topic-icon">{topic.icon}</div>
            <h4>{topic.title}</h4>
            <p>{topic.description}</p>
          </div>
        ))}
      </div>

      <div className="support-contact">
        <h3>Still need help?</h3>
        <p>Our support team is here for you</p>
        <div className="support-contact-buttons">
          <button className="ps-menu-btn ps-menu-btn--primary">💬 Live Chat</button>
          <button className="ps-menu-btn ps-menu-btn--secondary">📧 Email Support</button>
        </div>
      </div>

      <style>{`
        .support-search {
          margin-bottom: 32px;
        }

        .support-search-input {
          width: 100%;
          padding: 14px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 16px;
        }

        .support-search-input::placeholder {
          color: var(--muted);
        }

        .support-section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--gold);
        }

        .support-topic {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .support-topic:hover {
          border-color: rgba(230,184,0,0.3);
          transform: translateY(-2px);
        }

        .support-topic-icon {
          font-size: 32px;
          margin-bottom: 12px;
        }

        .support-topic h4 {
          font-size: 16px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .support-topic p {
          font-size: 14px;
          color: var(--muted);
          margin: 0;
        }

        .support-contact {
          margin-top: 40px;
          padding: 32px;
          background: linear-gradient(135deg, rgba(230,184,0,0.1), rgba(230,184,0,0.05));
          border: 1px solid rgba(230,184,0,0.2);
          border-radius: 16px;
          text-align: center;
        }

        .support-contact h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .support-contact p {
          color: var(--muted);
          margin: 0 0 20px 0;
        }

        .support-contact-buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
        }
      `}</style>
    </MenuPageLayout>
  );
}



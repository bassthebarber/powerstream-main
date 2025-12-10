// frontend/src/pages/menu/SettingsPage.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [activeSection, setActiveSection] = useState("account");

  const displayName = user?.name || user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "user@powerstream.com";

  const sections = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "audio", label: "Audio & Video", icon: "🔊" },
  ];

  return (
    <MenuPageLayout
      icon="⚙️"
      title="Settings"
      subtitle="Manage your PowerStream preferences"
    >
      <div className="settings-layout">
        <aside className="settings-sidebar">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`settings-nav-item ${activeSection === section.id ? "settings-nav-item--active" : ""}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.icon}</span>
              <span>{section.label}</span>
            </button>
          ))}
          <button className="settings-nav-item settings-nav-item--danger" onClick={signOut}>
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </aside>

        <main className="settings-content">
          {activeSection === "account" && (
            <div className="settings-section">
              <h3>Account Settings</h3>
              
              <div className="settings-field">
                <label>Display Name</label>
                <input type="text" defaultValue={displayName} className="settings-input" />
              </div>
              
              <div className="settings-field">
                <label>Email</label>
                <input type="email" defaultValue={email} className="settings-input" disabled />
              </div>
              
              <div className="settings-field">
                <label>Username</label>
                <input type="text" defaultValue={`@${displayName.toLowerCase().replace(/\s/g, "")}`} className="settings-input" />
              </div>

              <button className="ps-menu-btn ps-menu-btn--primary">Save Changes</button>
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="settings-section">
              <h3>Privacy Settings</h3>
              
              <div className="settings-toggle">
                <div>
                  <h4>Private Account</h4>
                  <p>Only approved followers can see your content</p>
                </div>
                <input type="checkbox" className="settings-checkbox" />
              </div>
              
              <div className="settings-toggle">
                <div>
                  <h4>Show Activity Status</h4>
                  <p>Let others see when you're online</p>
                </div>
                <input type="checkbox" className="settings-checkbox" defaultChecked />
              </div>
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="settings-section">
              <h3>Notification Preferences</h3>
              
              <div className="settings-toggle">
                <div>
                  <h4>Push Notifications</h4>
                  <p>Receive notifications on your device</p>
                </div>
                <input type="checkbox" className="settings-checkbox" defaultChecked />
              </div>
              
              <div className="settings-toggle">
                <div>
                  <h4>Email Notifications</h4>
                  <p>Receive email updates</p>
                </div>
                <input type="checkbox" className="settings-checkbox" />
              </div>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="settings-section">
              <h3>Appearance</h3>
              <p className="settings-note">Theme: Dark Mode (PowerStream default)</p>
            </div>
          )}

          {activeSection === "audio" && (
            <div className="settings-section">
              <h3>Audio & Video</h3>
              
              <div className="settings-toggle">
                <div>
                  <h4>Autoplay Videos</h4>
                  <p>Automatically play videos in feed</p>
                </div>
                <input type="checkbox" className="settings-checkbox" defaultChecked />
              </div>
              
              <div className="settings-toggle">
                <div>
                  <h4>High Quality Audio</h4>
                  <p>Stream audio at higher quality (uses more data)</p>
                </div>
                <input type="checkbox" className="settings-checkbox" defaultChecked />
              </div>
            </div>
          )}
        </main>
      </div>

      <style>{`
        .settings-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 24px;
        }

        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }
        }

        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .settings-nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: none;
          border-radius: 10px;
          color: var(--muted);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .settings-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: #fff;
        }

        .settings-nav-item--active {
          background: rgba(230,184,0,0.15);
          color: var(--gold);
        }

        .settings-nav-item--danger {
          color: #ff6b6b;
          margin-top: auto;
        }

        .settings-nav-item--danger:hover {
          background: rgba(255,107,107,0.1);
        }

        .settings-content {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
        }

        .settings-section h3 {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 24px 0;
          color: var(--gold);
        }

        .settings-field {
          margin-bottom: 20px;
        }

        .settings-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 8px;
        }

        .settings-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
        }

        .settings-input:disabled {
          opacity: 0.6;
        }

        .settings-toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .settings-toggle h4 {
          font-size: 14px;
          font-weight: 600;
          margin: 0 0 4px 0;
        }

        .settings-toggle p {
          font-size: 13px;
          color: var(--muted);
          margin: 0;
        }

        .settings-checkbox {
          width: 20px;
          height: 20px;
          accent-color: var(--gold);
        }

        .settings-note {
          color: var(--muted);
          font-size: 14px;
        }
      `}</style>
    </MenuPageLayout>
  );
}




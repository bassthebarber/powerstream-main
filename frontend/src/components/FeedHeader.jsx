// frontend/src/components/FeedHeader.jsx
// PowerFeed top header bar with search, + menu, and AI Pulse
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function FeedHeader({ onSearch, onAIPulse }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [aiPrompt, setAIPrompt] = useState("");
  const plusMenuRef = useRef(null);

  // User info
  const displayName = user?.name || user?.displayName || user?.email?.split("@")[0] || "Guest";
  const avatarUrl = user?.avatarUrl || user?.avatar;
  const initials = displayName.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() || "U";

  // Close plus menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (plusMenuRef.current && !plusMenuRef.current.contains(e.target)) {
        setShowPlusMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  const handleAIPulseClick = () => {
    setShowAIModal(true);
    setShowPlusMenu(false);
  };

  const handleAISubmit = (e) => {
    e.preventDefault();
    if (onAIPulse && aiPrompt.trim()) {
      onAIPulse(aiPrompt.trim());
    }
    setAIPrompt("");
    setShowAIModal(false);
  };

  const plusMenuItems = [
    { icon: "📷", label: "Create Story", action: () => navigate("/powergram", { state: { mode: "story" } }) },
    { icon: "🎬", label: "Create Reel", action: () => navigate("/powerreel", { state: { mode: "create" } }) },
    { icon: "🔴", label: "Go Live", action: () => navigate("/powerharmony/live") },
    { icon: "✏️", label: "Create Note", action: () => setShowPlusMenu(false) },
    { icon: "🤖", label: "Ask AI", action: handleAIPulseClick },
  ];

  return (
    <>
      <header className="pf-header-bar">
        <div className="pf-header-left">
          <div className="pf-header-logo" onClick={() => navigate("/powerfeed")}>
            <span className="pf-header-logo-icon">⚡</span>
            <span className="pf-header-logo-text">PowerFeed</span>
          </div>
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              className="pf-header-avatar"
              onClick={() => navigate("/feed/profile")}
            />
          ) : (
            <div 
              className="pf-header-avatar pf-header-avatar--initials"
              onClick={() => navigate("/feed/profile")}
            >
              {initials}
            </div>
          )}
        </div>

        <div className="pf-header-center">
          {showSearch ? (
            <form onSubmit={handleSearch} className="pf-header-search-form">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PowerStream..."
                className="pf-header-search-input"
                autoFocus
              />
              <button type="button" className="pf-header-search-close" onClick={() => setShowSearch(false)}>
                ×
              </button>
            </form>
          ) : (
            <button className="pf-header-search-btn" onClick={() => setShowSearch(true)}>
              <span>🔍</span>
              <span>Search for people & posts</span>
            </button>
          )}
        </div>

        <div className="pf-header-right">
          {/* AI Pulse Button */}
          <button 
            className="pf-header-ai-btn"
            onClick={handleAIPulseClick}
            title="AI Pulse"
          >
            <span>🤖</span>
            <span className="pf-header-ai-text">AI</span>
          </button>

          {/* Plus Menu */}
          <div className="pf-header-plus-container" ref={plusMenuRef}>
            <button 
              className="pf-header-plus-btn"
              onClick={() => setShowPlusMenu(!showPlusMenu)}
            >
              +
            </button>

            {showPlusMenu && (
              <div className="pf-header-plus-menu">
                {plusMenuItems.map((item, idx) => (
                  <button
                    key={idx}
                    className="pf-header-plus-item"
                    onClick={item.action}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu Button */}
          <button 
            className="pf-header-menu-btn"
            onClick={() => navigate("/feed/menu")}
            title="Menu"
          >
            ☰
          </button>
        </div>
      </header>

      {/* AI Pulse Modal */}
      {showAIModal && (
        <div className="pf-ai-modal-overlay" onClick={() => setShowAIModal(false)}>
          <div className="pf-ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pf-ai-modal-header">
              <h3>🤖 AI Pulse</h3>
              <button onClick={() => setShowAIModal(false)}>×</button>
            </div>
            <div className="pf-ai-modal-body">
              <p className="pf-ai-modal-subtitle">
                Ask AI anything about your feed, get writing help, or generate content ideas.
              </p>
              <form onSubmit={handleAISubmit}>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAIPrompt(e.target.value)}
                  placeholder="What would you like to ask AI?"
                  className="pf-ai-modal-input"
                  rows={4}
                  autoFocus
                />
                <div className="pf-ai-modal-actions">
                  <button type="button" onClick={() => setShowAIModal(false)} className="pf-ai-modal-cancel">
                    Cancel
                  </button>
                  <button type="submit" className="pf-ai-modal-submit" disabled={!aiPrompt.trim()}>
                    Ask AI
                  </button>
                </div>
              </form>
              <div className="pf-ai-modal-suggestions">
                <p>Suggestions:</p>
                <div className="pf-ai-suggestion-chips">
                  {["Write a caption for my photo", "Generate post ideas", "Help me respond to comments"].map((s, i) => (
                    <button key={i} onClick={() => setAIPrompt(s)} className="pf-ai-suggestion-chip">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .pf-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          background: linear-gradient(180deg, #0d0d0f, #080809);
          border-bottom: 1px solid rgba(255,255,255,0.08);
          position: sticky;
          top: 56px;
          z-index: 90;
          gap: 16px;
        }

        .pf-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .pf-header-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }

        .pf-header-logo-icon {
          font-size: 24px;
        }

        .pf-header-logo-text {
          font-size: 18px;
          font-weight: 800;
          background: linear-gradient(90deg, var(--gold), var(--gold-soft));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .pf-header-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
          cursor: pointer;
          border: 2px solid rgba(230,184,0,0.3);
        }

        .pf-header-avatar--initials {
          background: linear-gradient(135deg, var(--gold), var(--gold-soft));
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
        }

        .pf-header-center {
          flex: 1;
          max-width: 500px;
        }

        .pf-header-search-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 10px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: var(--muted);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pf-header-search-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(230,184,0,0.3);
        }

        .pf-header-search-form {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .pf-header-search-input {
          flex: 1;
          padding: 10px 16px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(230,184,0,0.3);
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
          outline: none;
        }

        .pf-header-search-close {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 18px;
          cursor: pointer;
        }

        .pf-header-right {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .pf-header-ai-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: linear-gradient(135deg, rgba(230,184,0,0.15), rgba(230,184,0,0.05));
          border: 1px solid rgba(230,184,0,0.3);
          border-radius: 999px;
          color: var(--gold);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pf-header-ai-btn:hover {
          background: linear-gradient(135deg, rgba(230,184,0,0.25), rgba(230,184,0,0.1));
          transform: translateY(-1px);
        }

        .pf-header-ai-text {
          display: none;
        }

        @media (min-width: 640px) {
          .pf-header-ai-text {
            display: inline;
          }
        }

        .pf-header-plus-container {
          position: relative;
        }

        .pf-header-plus-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--gold);
          border: none;
          color: #000;
          font-size: 24px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .pf-header-plus-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 4px 16px rgba(230,184,0,0.4);
        }

        .pf-header-plus-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: #1a1a1f;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          padding: 8px;
          min-width: 180px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.5);
          z-index: 100;
        }

        .pf-header-plus-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 12px;
          background: transparent;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .pf-header-plus-item:hover {
          background: rgba(255,255,255,0.08);
        }

        .pf-header-menu-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.1);
          color: #fff;
          font-size: 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pf-header-menu-btn:hover {
          background: rgba(255,255,255,0.12);
        }

        /* AI Modal */
        .pf-ai-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .pf-ai-modal {
          width: 100%;
          max-width: 480px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(230,184,0,0.2);
          border-radius: 16px;
          overflow: hidden;
        }

        .pf-ai-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .pf-ai-modal-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: var(--gold);
        }

        .pf-ai-modal-header button {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255,255,255,0.1);
          border: none;
          color: #fff;
          font-size: 20px;
          cursor: pointer;
        }

        .pf-ai-modal-body {
          padding: 20px;
        }

        .pf-ai-modal-subtitle {
          color: var(--muted);
          font-size: 14px;
          margin: 0 0 16px 0;
        }

        .pf-ai-modal-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px;
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          resize: none;
        }

        .pf-ai-modal-input:focus {
          outline: none;
          border-color: rgba(230,184,0,0.4);
        }

        .pf-ai-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 16px;
        }

        .pf-ai-modal-cancel {
          padding: 10px 20px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 999px;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }

        .pf-ai-modal-submit {
          padding: 10px 24px;
          background: var(--gold);
          border: none;
          border-radius: 999px;
          color: #000;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .pf-ai-modal-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pf-ai-modal-suggestions {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }

        .pf-ai-modal-suggestions p {
          color: var(--muted);
          font-size: 12px;
          margin: 0 0 10px 0;
        }

        .pf-ai-suggestion-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .pf-ai-suggestion-chip {
          padding: 6px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          color: var(--muted);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .pf-ai-suggestion-chip:hover {
          background: rgba(230,184,0,0.1);
          border-color: rgba(230,184,0,0.3);
          color: var(--gold);
        }

        @media (max-width: 640px) {
          .pf-header-bar {
            padding: 10px 12px;
          }

          .pf-header-logo-text {
            display: none;
          }

          .pf-header-search-btn span:last-child {
            display: none;
          }
        }
      `}</style>
    </>
  );
}



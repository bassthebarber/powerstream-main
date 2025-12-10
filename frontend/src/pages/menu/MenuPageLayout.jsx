// frontend/src/pages/menu/MenuPageLayout.jsx
// Shared layout for menu pages
import React from "react";
import { useNavigate } from "react-router-dom";

export default function MenuPageLayout({ icon, title, subtitle, children, backPath = "/feed/menu" }) {
  const navigate = useNavigate();

  return (
    <div className="ps-menu-page">
      <header className="ps-menu-header">
        <button className="ps-menu-back" onClick={() => navigate(backPath)}>
          ← Back
        </button>
        <div className="ps-menu-title-area">
          <span className="ps-menu-icon">{icon}</span>
          <div>
            <h1 className="ps-menu-title">{title}</h1>
            {subtitle && <p className="ps-menu-subtitle">{subtitle}</p>}
          </div>
        </div>
      </header>
      <main className="ps-menu-content">
        {children}
      </main>

      <style>{`
        @keyframes menuFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes menuFadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes menuFadeInScale {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }

        .ps-menu-page {
          min-height: 100vh;
          background: radial-gradient(ellipse at top, #0a0a0e 0%, #000 70%);
          color: #fff;
          animation: menuFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .ps-menu-header {
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          background: linear-gradient(180deg, rgba(10, 10, 14, 0.8) 0%, transparent 100%);
          animation: menuFadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .ps-menu-back {
          background: transparent;
          border: none;
          color: var(--gold, #e6b800);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 0;
          margin-bottom: 16px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .ps-menu-back:hover {
          color: #ffda5c;
          transform: translateX(-4px);
        }

        .ps-menu-title-area {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .ps-menu-icon {
          font-size: 44px;
          filter: drop-shadow(0 4px 12px rgba(230, 184, 0, 0.2));
        }

        .ps-menu-title {
          font-size: 32px;
          font-weight: 800;
          margin: 0;
          background: linear-gradient(90deg, var(--gold, #e6b800) 0%, #ffda5c 50%, var(--gold, #e6b800) 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: gradientShift 4s ease infinite;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .ps-menu-subtitle {
          color: #888;
          font-size: 15px;
          margin: 6px 0 0 0;
        }

        .ps-menu-content {
          padding: 28px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .ps-menu-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .ps-menu-card {
          background: linear-gradient(135deg, rgba(26, 26, 31, 0.95) 0%, rgba(15, 15, 18, 0.98) 100%);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px;
          padding: 24px;
          transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
          animation: menuFadeInScale 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
        }
        
        .ps-menu-card:nth-child(1) { animation-delay: 0ms; }
        .ps-menu-card:nth-child(2) { animation-delay: 50ms; }
        .ps-menu-card:nth-child(3) { animation-delay: 100ms; }
        .ps-menu-card:nth-child(4) { animation-delay: 150ms; }
        .ps-menu-card:nth-child(5) { animation-delay: 200ms; }

        .ps-menu-card:hover {
          border-color: rgba(230,184,0,0.4);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(230, 184, 0, 0.15);
        }

        .ps-menu-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .ps-menu-card-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: rgba(230,184,0,0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ps-menu-card-title {
          font-size: 16px;
          font-weight: 700;
          margin: 0;
        }

        .ps-menu-card-meta {
          font-size: 12px;
          color: var(--muted);
        }

        .ps-menu-card-body {
          color: var(--muted);
          font-size: 14px;
        }

        .ps-menu-card-footer {
          margin-top: 16px;
          display: flex;
          gap: 8px;
        }

        .ps-menu-btn {
          padding: 8px 16px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .ps-menu-btn--primary {
          background: var(--gold);
          border: none;
          color: #000;
        }

        .ps-menu-btn--primary:hover {
          background: #ffc933;
        }

        .ps-menu-btn--secondary {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
        }

        .ps-menu-btn--secondary:hover {
          background: rgba(255,255,255,0.08);
        }

        .ps-menu-empty {
          text-align: center;
          padding: 60px 20px;
          color: var(--muted);
        }

        .ps-menu-empty-icon {
          font-size: 60px;
          margin-bottom: 16px;
          opacity: 0.5;
        }

        .ps-menu-empty h3 {
          color: #fff;
          margin: 0 0 8px 0;
        }

        .ps-menu-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .ps-menu-list-item {
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

        .ps-menu-list-item:hover {
          border-color: rgba(230,184,0,0.3);
        }

        @media (max-width: 640px) {
          .ps-menu-header {
            padding: 16px;
          }

          .ps-menu-content {
            padding: 16px;
          }

          .ps-menu-title {
            font-size: 22px;
          }

          .ps-menu-icon {
            font-size: 32px;
          }
        }
      `}</style>
    </div>
  );
}


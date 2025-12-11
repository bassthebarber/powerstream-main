// frontend/studio-app/src/pages/NotFound.jsx
// 404 Not Found page for PowerHarmony Studio

import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found">
      <style>{`
        .not-found {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #fff;
          text-align: center;
          padding: 2rem;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .not-found-code {
          font-size: 8rem;
          font-weight: 700;
          color: #d4af37;
          line-height: 1;
          margin-bottom: 1rem;
          text-shadow: 0 0 40px rgba(212, 175, 55, 0.3);
        }

        .not-found-title {
          font-size: 1.5rem;
          color: #fff;
          margin-bottom: 0.5rem;
        }

        .not-found-message {
          font-size: 1rem;
          color: #888;
          margin-bottom: 2rem;
          max-width: 400px;
        }

        .not-found-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.5rem;
          background: #d4af37;
          color: #000;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s;
        }

        .not-found-link:hover {
          background: #e5c349;
          transform: translateY(-2px);
        }

        .not-found-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }
      `}</style>

      <div className="not-found-icon">🎛️</div>
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-message">
        The page you're looking for doesn't exist in the studio. 
        Maybe the beat dropped too hard and the page got lost.
      </p>
      <Link to="/" className="not-found-link">
        ← Back to Studio
      </Link>
    </div>
  );
}




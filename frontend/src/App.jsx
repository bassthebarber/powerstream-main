// frontend/src/App.jsx
// PowerStream Main Frontend - App Root Component

import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import PowerFeed from "./pages/PowerFeed.jsx";
import PowerGram from "./pages/PowerGram.jsx";
import PowerReel from "./pages/PowerReel.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import TVStations from "./pages/TVStations.jsx";
import SouthernPower from "./pages/SouthernPower.jsx";
import WorldTV from "./pages/WorldTV.jsx";
import PowerStreamTV from "./pages/PowerStreamTV.jsx";
import StationDetail from "./pages/StationDetail.jsx";
import FilmDetail from "./pages/FilmDetail.jsx";

// Welcome to PowerStream - Main Hub
const Home = () => {
  React.useEffect(() => {
    // Play welcome audio on first user interaction
    const audio = new Audio('/audio/welcome.mp3');
    const playOnce = () => {
      audio.play().catch(() => {});
      window.removeEventListener('click', playOnce);
      window.removeEventListener('touchstart', playOnce);
    };
    window.addEventListener('click', playOnce, { once: true });
    window.addEventListener('touchstart', playOnce, { once: true });
  }, []);

  return (
    <div className="ps-page">
      <div className="ps-welcome-header">
        <img src="/logos/powerstream-logo.png" alt="PowerStream" className="ps-logo-spin" />
        <h1>Welcome to PowerStream</h1>
        <p className="ps-subtitle">Stream Audio • Video • Live TV • Chat • Community</p>
      </div>
      <div className="ps-grid">
        <Link to="/powerfeed" className="ps-tile">📱 PowerFeed</Link>
        <Link to="/powergram" className="ps-tile">📸 PowerGram</Link>
        <Link to="/powerreel" className="ps-tile">🎬 PowerReel</Link>
        <Link to="/powerline" className="ps-tile">💬 PowerLine</Link>
        <Link to="/tv-stations" className="ps-tile">📺 TV Stations</Link>
        <Link to="/southern-power" className="ps-tile">🌐 Southern Power Syndicate</Link>
        <Link to="/world-tv" className="ps-tile">🌍 Worldwide TV</Link>
        <Link to="/powerstream-tv" className="ps-tile">🎥 PowerStream TV</Link>
      </div>
    </div>
  );
};

const NotFound = () => (
  <div className="ps-page">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/" className="ps-back">← Back to Home</Link>
  </div>
);

// Navigation component
const Nav = () => {
  const { pathname } = useLocation();
  
  const navItems = [
    { path: "/", label: "🏠 Home" },
    { path: "/powerfeed", label: "📱 Feed" },
    { path: "/powergram", label: "📸 Gram" },
    { path: "/powerreel", label: "🎬 Reel" },
    { path: "/powerline", label: "💬 Line" },
    { path: "/tv-stations", label: "📺 TV" },
    { path: "/southern-power", label: "🌐 SPS" },
    { path: "/powerstream-tv", label: "🎥 PS TV" },
    { path: "/ps-tv", label: "🎥 PS TV" },
  ];

  return (
    <nav className="ps-nav">
      <div className="ps-nav-brand">
        <Link to="/" className="ps-nav-logo">PowerStream</Link>
      </div>
      <div className="ps-nav-links">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`ps-nav-link ${pathname === path ? "ps-nav-link--active" : ""}`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

// Main App component with routes
export default function App() {
  return (
    <div className="ps-app">
      <Nav />
      <main className="ps-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/powerfeed" element={<PowerFeed />} />
          <Route path="/powergram" element={<PowerGram />} />
          <Route path="/powerreel" element={<PowerReel />} />
          <Route path="/powerline" element={<PowerLine />} />
          <Route path="/tv-stations" element={<TVStations />} />
          <Route path="/tv-stations/:slug" element={<StationDetail />} />
          <Route path="/southern-power" element={<SouthernPower />} />
          <Route path="/world-tv" element={<WorldTV />} />
          <Route path="/powerstream-tv" element={<PowerStreamTV />} />
          <Route path="/ps-tv" element={<PowerStreamTV />} />
          <Route path="/powerstream-tv/title/:id" element={<FilmDetail />} />
          <Route path="/ps-tv/title/:id" element={<FilmDetail />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <style>{`
        :root {
          --bg: #000;
          --panel: #0f0f10;
          --text: #fff;
          --muted: #888;
          --gold: #e6b800;
          --gold-soft: #ffda5c;
        }
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          background: var(--bg);
          color: var(--text);
          min-height: 100vh;
        }
        
        .ps-app {
          min-height: 100vh;
        }
        
        .ps-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: linear-gradient(180deg, #0b0b0c, #050506);
          border-bottom: 1px solid #1e1e21;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        
        .ps-nav-logo {
          font-size: 1.4rem;
          font-weight: 900;
          background: linear-gradient(90deg, var(--gold), var(--gold-soft));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: none;
        }
        
        .ps-nav-links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        
        .ps-nav-link {
          color: var(--text);
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          transition: all 0.15s ease;
        }
        
        .ps-nav-link:hover {
          background: rgba(255,255,255,0.08);
        }
        
        .ps-nav-link--active {
          background: var(--gold);
          color: #000;
        }
        
        .ps-main {
          padding: 32px 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .ps-page h1 {
          font-size: 2.5rem;
          font-weight: 900;
          margin-bottom: 12px;
          background: linear-gradient(90deg, var(--gold), var(--gold-soft));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .ps-subtitle {
          color: var(--muted);
          font-size: 1.1rem;
          margin-bottom: 32px;
        }
        
        .ps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
        
        .ps-tile {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 16px;
          border-radius: 14px;
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.06);
          color: var(--text);
          text-decoration: none;
          font-weight: 700;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        
        .ps-card {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 24px;
        }
        
        .ps-tile:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.5);
          border-color: rgba(230,184,0,0.3);
        }
        
        .ps-tile--gold {
          background: linear-gradient(135deg, var(--gold) 0%, #c9a000 100%);
          color: #000;
          border: none;
        }
        
        .ps-tile--gold:hover {
          filter: brightness(1.1);
        }
        
        .ps-back {
          display: inline-block;
          margin-top: 24px;
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
        }
        
        .ps-back:hover {
          text-decoration: underline;
        }
        
        .ps-welcome-header {
          text-align: center;
          margin-bottom: 48px;
        }
        
        .ps-logo-spin {
          width: 120px;
          height: 120px;
          margin-bottom: 24px;
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}



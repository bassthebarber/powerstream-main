// frontend/src/App.jsx
// PowerStream Main Frontend - App Root Component

import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PowerFeed from "./pages/PowerFeed.jsx";
import FeedMenu from "./pages/FeedMenu.jsx";
import PowerGram from "./pages/PowerGram.jsx";
import PowerReel from "./pages/PowerReel.jsx";
import PowerLine from "./pages/PowerLine.jsx";
import TVStations from "./pages/TVStations.jsx";
import TVGuide from "./pages/TVGuide.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";
import SouthernPower from "./pages/SouthernPower.jsx";
import WorldTV from "./pages/WorldTV.jsx";
import PowerStreamTV from "./pages/PowerStreamTV.jsx";
import StationDetail from "./pages/StationDetail.jsx";
import FilmDetail from "./pages/FilmDetail.jsx";
import Home from "./pages/Home.jsx";
import Studio from "./pages/Studio.jsx";
import AIBrain from "./pages/AIBrain.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Layout from "./components/Layout.jsx";
import GlobalNav from "./components/GlobalNav.jsx";
import MultistreamDashboard from "./pages/MultistreamDashboard.jsx";
// PowerHarmony imports
import {
  PowerHarmonyMaster,
  PowerHarmonyWrite,
  PowerHarmonyLive,
  PowerHarmonyVocal,
  PowerHarmonyMix,
  PowerHarmonyMastering,
  PowerHarmonyRecord,
} from "./pages/powerharmony";
import "./styles/powerharmony.css";

const NotFound = () => (
  <div className="ps-page">
    <h1>404 - Page Not Found</h1>
    <p>The page you're looking for doesn't exist.</p>
    <Link to="/" className="ps-back">← Back to Home</Link>
  </div>
);

// Main App component with routes
export default function App() {
  return (
    <div className="ps-app">
      <GlobalNav />
      <main className="ps-main">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<RegisterPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Everything below requires login once */}
          <Route
            path="/powerfeed"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerFeed />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/menu"
            element={
              <ProtectedRoute>
                <Layout>
                  <FeedMenu />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/powergram"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerGram />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerreel"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerReel />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerline"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerLine />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv-stations"
            element={
              <ProtectedRoute>
                <Layout>
                  <TVStations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv-stations/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <StationDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv-guide"
            element={
              <ProtectedRoute>
                <Layout>
                  <TVGuide />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/shows/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <ShowDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/southern-power"
            element={
              <ProtectedRoute>
                <Layout>
                  <SouthernPower />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/world-tv"
            element={
              <ProtectedRoute>
                  <Layout>
                    <WorldTV />
                  </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerstream-tv"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerStreamTV />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ps-tv"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerStreamTV />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerstream-tv/title/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FilmDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/ps-tv/title/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FilmDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/studio"
            element={
              <ProtectedRoute>
                <Layout>
                  <Studio />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* PowerHarmony Routes */}
          <Route
            path="/powerharmony/master"
            element={
              <ProtectedRoute>
                <PowerHarmonyMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/write"
            element={
              <ProtectedRoute>
                <PowerHarmonyWrite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/live"
            element={
              <ProtectedRoute>
                <PowerHarmonyLive />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/vocal"
            element={
              <ProtectedRoute>
                <PowerHarmonyVocal />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/mix"
            element={
              <ProtectedRoute>
                <PowerHarmonyMix />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/mastering"
            element={
              <ProtectedRoute>
                <PowerHarmonyMastering />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/record"
            element={
              <ProtectedRoute>
                <PowerHarmonyRecord />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/writing"
            element={
              <ProtectedRoute>
                <PowerHarmonyWrite />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-brain"
            element={
              <ProtectedRoute>
                <AIBrain />
              </ProtectedRoute>
            }
          />
          <Route
            path="/multistream"
            element={
              <ProtectedRoute requireAdmin={false}>
                <MultistreamDashboard />
              </ProtectedRoute>
            }
          />
          {/* Alias /feed to /powerfeed for convenience */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <PowerFeed />
              </ProtectedRoute>
            }
          />
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



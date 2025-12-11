// frontend/src/App.jsx
// PowerStream Main Frontend - App Root Component

import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import PowerFeed from "./pages/PowerFeed.jsx";
import FeedMenu from "./pages/FeedMenu.jsx";
import PowerGram from "./pages/PowerGram.jsx";
import PowerReel from "./pages/PowerReel.jsx";
// PowerLine V5 - Messenger-style chat
// PowerLine Messenger (from folder with named exports)
import { Conversations as PowerLineConversations, ChatWindow as PowerLineChatWindow } from "./pages/PowerLine/index.js";
import PowerLine from "./pages/PowerLine.jsx"; // Legacy fallback (single file)
import TVStations from "./pages/TVStations.jsx";
import TVGuide from "./pages/TVGuide.jsx";
import ShowDetail from "./pages/ShowDetail.jsx";
// Golden TV Subsystem - Station Pages
import SouthernPower from "./pages/SouthernPower.jsx";
import NoLimitEastHouston from "./pages/NoLimitEastHouston.jsx";
import CivicConnect from "./pages/CivicConnect.jsx";
import TexasGotTalent from "./pages/TexasGotTalent.jsx";
import TVGuidePage from "./pages/TVGuidePage.jsx";
import StationViewPage from "./pages/StationViewPage.jsx";
import WorldTV from "./pages/WorldTV.jsx";
import PowerStreamTV from "./pages/PowerStreamTV/PowerStreamTV.jsx";
import FilmDetailPage from "./pages/PowerStreamTV/FilmDetail.jsx";
import UploadFilm from "./pages/PowerStreamTV/UploadFilm.jsx";
import { TVHome, TVWatch, VideoPlayer } from "./powerstream-tv";
import StationDetail from "./pages/StationDetail.jsx";
import StationPage from "./pages/StationPage.jsx";
import BroadcastControlRoom from "./components/tv/BroadcastControlRoom.jsx";
import StationCatalog from "./components/tv/StationCatalog.jsx";
import StationHome from "./components/tv/StationHome.jsx";
import StationVideoPlayer from "./components/tv/player/StationVideoPlayer.jsx";
import NetflixHome from "./pages/netflix/NetflixHome.jsx";
import MoviePage from "./pages/netflix/MoviePage.jsx";
import UploadMovie from "./pages/netflix/UploadMovie.jsx";
import BrowseMovies from "./pages/netflix/BrowseMovies.jsx";
import MovieDetail from "./pages/netflix/MovieDetail.jsx";
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

// Menu pages
import {
  FriendsPage,
  GroupsPage,
  MarketplacePage,
  MemoriesPage,
  SavedPage,
  EventsPage,
  GamesPage,
  WatchPage,
  PagesPage,
  JobsPage,
  SupportPage,
  SettingsPage,
  AnalyticsPage,
  ProfilePage,
} from "./pages/menu";

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

// Studio page imports
import StudioRoyaltyPage from "./pages/studio/StudioRoyaltyPage.jsx";
import StudioLibraryPage from "./pages/studio/StudioLibraryPage.jsx";
import StudioSettingsPage from "./pages/studio/StudioSettingsPage.jsx";
import StudioBeatPage from "./pages/studio/StudioBeatPage.jsx";
import StudioExportPage from "./pages/studio/StudioExportPage.jsx";
import RecordingStudio from "./pages/RecordingStudio.jsx";

// Church Network imports
import ChurchNetworkHome from "./church/ChurchNetworkHome.jsx";
import ChurchStationPage from "./church/ChurchStationPage.jsx";
// Church Network aliases (new paths)
import { ChurchNetworkHome as ChurchNetworkHomePage, ChurchStation } from "./church-network";

// School Network imports
import SchoolNetworkHome from "./schools/SchoolNetworkHome.jsx";
import SchoolStationPage from "./schools/SchoolStationPage.jsx";
// School Network aliases (new paths)
import { SchoolNetworkHome as SchoolNetworkHomePage, SchoolStation } from "./school-network";

// No Limit Forever TV imports
import { NLFStationHome, NLFVideoPlayer, NLFGuide } from "./nlf-tv";

// No Limit Forever TV - Films & Documentaries Station
import { NoLimitForeverTVPage, NLFFilmWatchPage } from "./components/tv/stations/NoLimitForeverTV";

// No Limit East Houston Audio Station
import NoLimitAudio from "./pages/NoLimitAudio.jsx";

// Artist Audio Upload (Spotify-style)
import ArtistAudioUpload from "./pages/ArtistAudioUpload.jsx";

// Music Library - Main streaming page
import MusicLibrary from "./pages/MusicLibrary.jsx";

// Profile Page
import Profile from "./pages/Profile.jsx";

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
          
          {/* Profile Page - Public viewing, protected actions */}
          <Route
            path="/profile/:id"
            element={
              <Layout>
                <Profile />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <Profile />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Settings Profile Edit */}
          <Route
            path="/settings/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <SettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

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

          {/* Menu Pages - Phase 6 Fix */}
          <Route
            path="/feed/friends"
            element={
              <ProtectedRoute>
                <FriendsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/groups"
            element={
              <ProtectedRoute>
                <GroupsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/marketplace"
            element={
              <ProtectedRoute>
                <MarketplacePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/memories"
            element={
              <ProtectedRoute>
                <MemoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/saved"
            element={
              <ProtectedRoute>
                <SavedPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/events"
            element={
              <ProtectedRoute>
                <EventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/games"
            element={
              <ProtectedRoute>
                <GamesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/watch"
            element={
              <ProtectedRoute>
                <WatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/pages"
            element={
              <ProtectedRoute>
                <PagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/jobs"
            element={
              <ProtectedRoute>
                <JobsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/support"
            element={
              <ProtectedRoute>
                <SupportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/analytics"
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feed/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
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
          {/* PowerLine Messenger - FB Messenger Style */}
          <Route
            path="/powerline"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerLineConversations />
                </Layout>
              </ProtectedRoute>
            }
          >
            <Route
              path="chat/:conversationId"
              element={<PowerLineChatWindow />}
            />
          </Route>
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
          {/* Golden TV Subsystem - Station Pages */}
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
            path="/NoLimitEastHouston"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoLimitEastHouston />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/civic-connect"
            element={
              <ProtectedRoute>
                <Layout>
                  <CivicConnect />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/texas-got-talent"
            element={
              <ProtectedRoute>
                <Layout>
                  <TexasGotTalent />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tvguide"
            element={
              <ProtectedRoute>
                <Layout>
                  <TVGuidePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Netflix-style TV routes */}
          <Route
            path="/tv"
            element={
              <ProtectedRoute>
                <Layout>
                  <NetflixHome />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv/movie/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <MoviePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <UploadMovie />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* PowerStream TV – Netflix style browse */}
          <Route
            path="/tv/browse"
            element={
              <ProtectedRoute>
                <Layout>
                  <BrowseMovies />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Movie detail with trailer + PPV */}
          <Route
            path="/tv/movies/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <MovieDetail />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Dynamic station route - catches any /stations/:slug URL */}
          <Route
            path="/stations/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <StationViewPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* NEW: TV Stations with upgraded StationPage */}
          <Route
            path="/tv/stations/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <StationPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Station Video Catalog - Universal catalog for any station */}
          <Route
            path="/tv/:stationId/catalog"
            element={
              <ProtectedRoute>
                <Layout>
                  <StationCatalog />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Netflix-style Station Home - Universal home page */}
          <Route
            path="/tv/:stationId/home"
            element={
              <ProtectedRoute>
                <Layout>
                  <StationHome />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Video Player - Full screen video playback */}
          <Route
            path="/tv/:stationId/watch/:videoId"
            element={
              <ProtectedRoute>
                <StationVideoPlayer />
              </ProtectedRoute>
            }
          />
          {/* Broadcast Control Room - Admin page for managing broadcast schedules */}
          <Route
            path="/broadcast/control/:slug"
            element={
              <ProtectedRoute>
                <Layout>
                  <BroadcastControlRoom />
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
          {/* New PowerStream TV Routes */}
          <Route
            path="/powerstream"
            element={
              <ProtectedRoute>
                <TVHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerstream/watch/:id"
            element={
              <ProtectedRoute>
                <VideoPlayer />
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
            path="/powerstream-tv/film/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <FilmDetailPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerstream-tv/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <UploadFilm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tv/:stationSlug/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <UploadFilm />
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
          <Route
            path="/recording-studio"
            element={
              <ProtectedRoute>
                <RecordingStudio />
              </ProtectedRoute>
            }
          />
          
          {/* Church Network Routes */}
          <Route path="/church" element={<ChurchNetworkHome />} />
          <Route path="/church/:slug" element={<ChurchStationPage />} />
          <Route path="/church-network" element={<ChurchNetworkHomePage />} />
          <Route path="/church/:id" element={<ChurchStation />} />
          
          {/* School Network Routes */}
          <Route path="/schools" element={<SchoolNetworkHome />} />
          <Route path="/schools/:slug" element={<SchoolStationPage />} />
          <Route path="/school-network" element={<SchoolNetworkHomePage />} />
          <Route path="/school/:id" element={<SchoolStation />} />

          {/* No Limit Forever TV Routes */}
          <Route path="/nlf" element={<NLFStationHome />} />
          <Route path="/nlf/watch/:id" element={<NLFVideoPlayer />} />
          <Route path="/nlf/guide" element={<NLFGuide />} />
          <Route path="/nlf/videos" element={<NLFStationHome />} />
          <Route path="/nlf/live" element={<NLFVideoPlayer />} />

          {/* No Limit Forever TV - Films & Documentaries Station */}
          <Route path="/network/no-limit-forever" element={<NoLimitForeverTVPage />} />
          <Route path="/network/no-limit-forever/watch/:id" element={<NLFFilmWatchPage />} />
          
          {/* No Limit East Houston Audio Station */}
          <Route
            path="/stations/no-limit-east-houston/audio"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoLimitAudio />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/no-limit-audio"
            element={
              <ProtectedRoute>
                <Layout>
                  <NoLimitAudio />
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Music Library - Main streaming page */}
          <Route
            path="/music"
            element={
              <Layout>
                <MusicLibrary />
              </Layout>
            }
          />
          <Route
            path="/music-library"
            element={
              <Layout>
                <MusicLibrary />
              </Layout>
            }
          />
          
          {/* Artist Audio Upload (Spotify-style) */}
          <Route
            path="/artist/upload"
            element={
              <ProtectedRoute>
                <Layout>
                  <ArtistAudioUpload />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/nolimit/upload/audio"
            element={
              <ProtectedRoute>
                <Layout>
                  <ArtistAudioUpload />
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
          {/* Route Aliases for convenience */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerFeed />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/gram"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerGram />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reel"
            element={
              <ProtectedRoute>
                <Layout>
                  <PowerReel />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stations"
            element={
              <ProtectedRoute>
                <Layout>
                  <TVStations />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sps"
            element={
              <ProtectedRoute>
                <Layout>
                  <SouthernPower />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/worldwide-tv"
            element={
              <ProtectedRoute>
                <Layout>
                  <WorldTV />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* PowerHarmony deep routes */}
          <Route
            path="/powerharmony/royalty"
            element={
              <ProtectedRoute>
                <StudioRoyaltyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/library"
            element={
              <ProtectedRoute>
                <StudioLibraryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/settings"
            element={
              <ProtectedRoute>
                <StudioSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/beat"
            element={
              <ProtectedRoute>
                <StudioBeatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/powerharmony/export"
            element={
              <ProtectedRoute>
                <StudioExportPage />
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

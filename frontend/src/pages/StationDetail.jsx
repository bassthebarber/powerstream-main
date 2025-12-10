// frontend/src/pages/StationDetail.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import TalentVoting from "../components/TalentVoting.jsx";
import StreamPlayer from "../components/StreamPlayer.jsx";
import GoLiveModal from "../components/GoLiveModal.jsx";
import RecordedContent from "../components/RecordedContent.jsx";
import LiveNow from "../components/LiveNow.jsx";
import TVGuideGrid from "../components/TVGuideGrid.jsx";
import { getStationBySlug, STATIONS } from "../constants/stations.js";
import api from "../lib/api.js";
import { getLivepeerPlaybackUrl } from "../lib/livepeer.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function StationDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [streamUrl, setStreamUrl] = useState(null);
  const [playbackId, setPlaybackId] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [showGoLiveModal, setShowGoLiveModal] = useState(false);
  const [vodRefreshKey, setVodRefreshKey] = useState(0);
  const [schedule, setSchedule] = useState([]);
  const [activeTab, setActiveTab] = useState("live"); // live, guide, library
  const isTexasGotTalent = slug === "texas-got-talent";
  
  // Get base station data from constants
  const baseStation = getStationBySlug(slug) || STATIONS.find((s) => s.slug === slug);

  useEffect(() => {
    // Start with base station data from constants
    if (baseStation) {
      setStation(baseStation);
      setStreamUrl(baseStation.streamUrl);
    }
    
    // Try to fetch additional data from backend
    fetchStation();
    fetchLiveStatus();
  }, [slug, baseStation]);

  // Poll live status every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchLiveStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [slug]);

  // Fetch TV Guide schedule for this station
  const fetchSchedule = useCallback(async () => {
    if (!station?.id) return;
    try {
      const res = await api.get(`/stations/${station.id}/schedule`);
      if (res.data?.ok && res.data.schedule) {
        setSchedule(res.data.schedule);
      } else {
        // Provide mock schedule if none from API
        setSchedule([
          {
            _id: `${station.id}-now`,
            title: `${station.name} Programming`,
            description: "Current broadcast",
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 3600000).toISOString(),
            category: station.category || "General",
            stationId: { name: station.name, slug: station.slug },
          },
        ]);
      }
    } catch (err) {
      console.log("Schedule API not available");
    }
  }, [station?.id]);

  useEffect(() => {
    if (station?.id) {
      fetchSchedule();
    }
  }, [station?.id, fetchSchedule]);

  const fetchStation = async () => {
    try {
      const res = await api.get(`/tv-stations/${slug}`);
      const data = res.data;
      if (data?.ok && data.station) {
        const backendStation = data.station;
        // Merge backend data with base station data
        setStation({
          ...baseStation,
          ...backendStation,
          logo: backendStation.logoUrl || baseStation?.logo,
        });

        // Prefer playbackId from ingest or station directly
        const pid =
          backendStation.ingest?.playbackId ||
          backendStation.playbackId ||
          backendStation.livepeerPlaybackId ||
          "";
        if (pid) {
          setPlaybackId(pid);
          setStreamUrl(getLivepeerPlaybackUrl(pid));
        } else {
          const backendStreamUrl =
            backendStation.liveStreamUrl || backendStation.playbackUrl || null;
          if (backendStreamUrl) {
            setStreamUrl(backendStreamUrl);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching station:", err);
      // If backend fails, use base station data
      if (baseStation) {
        setStation(baseStation);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchLiveStatus = async () => {
    try {
      const res = await api.get("/live/status");
      if (res.data?.isLive && res.data?.stationId === station?.id) {
        setIsLive(true);
      } else {
        setIsLive(false);
      }
    } catch (error) {
      console.error("Error fetching live status:", error);
    }
  };

  if (loading) {
    return (
      <div className="ps-page">
        <p style={{ textAlign: "center", opacity: 0.7 }}>Loading station...</p>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="station-page not-found">
        <h1>Station not found</h1>
        <Link to="/stations" className="back-link">
          ← Back to TV Stations Hub
        </Link>
      </div>
    );
  }

  const recordedContent = station.recordedContent || station.playlist || [];
  const finalStreamUrl = streamUrl || station.streamUrl;

  return (
    <div className="station-page">
      <header className="station-header">
        <div className="station-header-left">
          {(station.logo || station.logoUrl) && (
            <img
              src={station.logo || station.logoUrl}
              alt={station.name}
              className="station-header-logo"
            />
          )}
          <div>
            <h1>{station.name}</h1>
            <p>{station.description}</p>
            <span className={`live-pill ${isLive || station.isLive ? "live" : "off-air"}`}>
              {isLive || station.isLive ? "🔴 LIVE" : "Off Air"}
            </span>
          </div>
        </div>

        <div className="station-header-right">
          {user && (
            <button
              onClick={() => setShowGoLiveModal(true)}
              style={{
                padding: "10px 20px",
                background: isLive ? "#ef4444" : "var(--gold)",
                color: "#000",
                border: "none",
                borderRadius: "8px",
                fontWeight: 700,
                cursor: "pointer",
                marginRight: "12px",
              }}
            >
              {isLive ? "🔴 LIVE" : "🔴 Go Live"}
            </button>
          )}
          <Link to="/stations" className="back-link">
            ← Back to Stations Hub
          </Link>
        </div>
      </header>

      <main className="station-main">
        {/* LiveNow component - shows current show if live */}
        <LiveNow stationId={station.id} />

        {/* Station Tabs */}
        <div className="station-tabs">
          <button 
            className={`station-tab ${activeTab === 'live' ? 'active' : ''}`}
            onClick={() => setActiveTab('live')}
          >
            📺 Live Channel
          </button>
          <button 
            className={`station-tab ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            📅 TV Guide
          </button>
          <button 
            className={`station-tab ${activeTab === 'library' ? 'active' : ''}`}
            onClick={() => setActiveTab('library')}
          >
            📚 Video Library
          </button>
        </div>
        
        {/* Live Channel Tab */}
        {activeTab === 'live' && (
          <section className="station-live-section">
            <h2>{station.isLive ? "Live Now" : "Channel Preview"}</h2>
            <StreamPlayer
              streamUrl={finalStreamUrl}
              playbackId={playbackId}
              stationId={station.id}
            />
          </section>
        )}

        {/* TV Guide Tab */}
        {activeTab === 'guide' && (
          <section className="station-guide-section">
            <h2>📅 {station.name} TV Guide</h2>
            {schedule.length > 0 ? (
              <TVGuideGrid shows={schedule} />
            ) : (
              <div className="station-empty-state">
                <p>No scheduled programming yet.</p>
                <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                  Check back soon for upcoming shows.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          <section className="station-recorded-section">
            <h2>📚 Video Library</h2>
            {/* VOD Assets from recordings (station-aware) */}
            <RecordedContent stationId={station.id} key={`${station.id}-${vodRefreshKey}`} />
          {isTexasGotTalent ? (
            <>

              {recordedContent.length > 0 ? (
                <div className="recorded-content-grid">
                  {recordedContent.map((item) => (
                    <div key={item._id || item.id} className="recorded-content-card">
                      {item.posterUrl && (
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="recorded-content-poster"
                        />
                      )}
                      <div className="recorded-content-info">
                        <div className="recorded-content-title">{item.title}</div>
                        {item.description && (
                          <div className="recorded-content-desc">
                            {item.description.substring(0, 100)}...
                          </div>
                        )}
                        <button
                          className="recorded-content-watch-btn"
                          onClick={() => {
                            if (item.videoUrl || item.hlsUrl) {
                              window.open(item.videoUrl || item.hlsUrl, "_blank");
                            }
                          }}
                        >
                          Watch Performance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content-message">No recorded performances available yet.</p>
              )}

              {/* Voting Panel - Only for Texas Got Talent */}
              {isTexasGotTalent && (
                <div className="talent-voting-section">
                  <TalentVoting stationSlug={slug} />
                </div>
              )}
            </>
          ) : (
            <>
              {recordedContent.length > 0 ? (
                <div className="recorded-content-grid">
                  {recordedContent.map((item, idx) => (
                    <div
                      key={item._id || item.id || idx}
                      className="recorded-content-card"
                      onClick={() => {
                        if (item.videoUrl || item.hlsUrl) {
                          window.open(item.videoUrl || item.hlsUrl, "_blank");
                        }
                      }}
                    >
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt={item.title || `Video ${idx + 1}`}
                          className="recorded-content-poster"
                        />
                      ) : (
                        <div className="recorded-content-placeholder">
                          {item.title || `Video ${idx + 1}`}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-content-message">No recorded content available for this station yet.</p>
              )}
            </>
          )}
          </section>
        )}
      </main>

      {/* Station Tab Styles */}
      <style>{`
        .station-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          overflow-x: auto;
        }
        
        .station-tab {
          padding: 10px 20px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: var(--muted);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        
        .station-tab:hover {
          background: rgba(255,255,255,0.1);
        }
        
        .station-tab.active {
          background: var(--gold);
          color: #000;
          border-color: var(--gold);
        }
        
        .station-empty-state {
          text-align: center;
          padding: 48px 24px;
          background: rgba(255,255,255,0.02);
          border-radius: 12px;
        }
        
        .station-guide-section h2 {
          margin-bottom: 24px;
        }
      `}</style>

      {/* Go Live Modal */}
      {showGoLiveModal && (
        <GoLiveModal
          isOpen={showGoLiveModal}
          onClose={() => setShowGoLiveModal(false)}
          stationId={station?.id}
          stationName={station?.name}
          onStarted={() => setIsLive(true)}
          onStopped={() => {
            setIsLive(false);
            setVodRefreshKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}


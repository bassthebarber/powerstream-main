// frontend/src/church/ChurchStationPage.jsx
// PowerStream Church Network - Individual Church Station Page

import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./ChurchNetwork.css";

const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

export default function ChurchStationPage() {
  const { slug } = useParams();
  const [station, setStation] = useState(null);
  const [services, setServices] = useState([]);
  const [liveService, setLiveService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    loadStation();
  }, [slug]);

  const loadStation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/church/stations/${slug}`);
      const data = await res.json();
      
      if (data.success) {
        setStation(data.station);
        setServices(data.services || []);
        setLiveService(data.liveService);
      } else {
        setError(data.error || "Station not found");
      }
    } catch (err) {
      console.error("[ChurchStation] Error:", err);
      setError("Failed to load station");
    } finally {
      setLoading(false);
    }
  };

  // Setup HLS player
  useEffect(() => {
    if (!station?.hlsUrl || !videoRef.current) return;

    const video = videoRef.current;
    
    // Check if HLS.js is available
    if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(station.hlsUrl);
      hls.attachMedia(video);
      
      hls.on(window.Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          console.error("[HLS] Fatal error:", data);
        }
      });
      
      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // Native HLS support (Safari)
      video.src = station.hlsUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station]);

  // Filter services
  const upcomingServices = services.filter(s => 
    !s.isReplayAvailable && new Date(s.serviceDate) >= new Date()
  );
  const pastServices = services.filter(s => 
    !s.isReplayAvailable && new Date(s.serviceDate) < new Date()
  );
  const replays = services.filter(s => s.isReplayAvailable);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="church-wrapper">
        <div className="church-loading">
          <div className="spinner"></div>
          <span>Loading church...</span>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="church-wrapper">
        <div className="church-error">
          <h2>⚠️ {error || "Station not found"}</h2>
          <Link to="/church" className="back-link">← Back to Church Network</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="church-wrapper">
      <Link to="/church" className="back-link">← Back to Church Network</Link>
      
      {/* Header */}
      <header className="church-station-header">
        <div className="station-header-left">
          {station.logoUrl ? (
            <img src={station.logoUrl} alt={station.name} className="station-logo-large" />
          ) : (
            <div className="station-logo-placeholder-lg">
              {station.name?.charAt(0) || "C"}
            </div>
          )}
          <div className="station-info">
            <h1>{station.name}</h1>
            {station.isLive && <span className="live-indicator">🔴 LIVE NOW</span>}
            {station.location && <p className="station-location">📍 {station.location}</p>}
            {station.pastorName && <p className="station-pastor">Pastor {station.pastorName}</p>}
            {station.denomination && <span className="denomination-badge">{station.denomination}</span>}
          </div>
        </div>
        
        {station.description && (
          <p className="station-description">{station.description}</p>
        )}
        
        {/* Contact & Links */}
        <div className="station-links">
          {station.website && (
            <a href={station.website} target="_blank" rel="noreferrer" className="station-link">
              🌐 Website
            </a>
          )}
          {station.address && (
            <span className="station-address">📍 {station.address}</span>
          )}
        </div>
        
        {/* Regular Schedule */}
        {station.regularServices && station.regularServices.length > 0 && (
          <div className="regular-schedule">
            <h4>Regular Services</h4>
            <div className="schedule-grid">
              {station.regularServices.map((svc, i) => (
                <div key={i} className="schedule-slot">
                  <span className="schedule-day">{svc.day}</span>
                  <span className="schedule-time">{svc.time}</span>
                  {svc.name && <span className="schedule-name">{svc.name}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Live Stream Section */}
      <section className="live-stream-section">
        <h2>
          {station.isLive ? "🔴 Live Now" : "Live Stream"}
          {liveService && ` - ${liveService.title}`}
        </h2>
        
        <div className="video-container">
          <video
            ref={videoRef}
            controls
            playsInline
            className="church-video-player"
            poster={station.bannerUrl || station.logoUrl}
          />
          
          {!station.isLive && (
            <div className="offline-overlay">
              <span className="offline-icon">📺</span>
              <p>Not currently streaming</p>
              <p className="offline-hint">Check the schedule for upcoming services</p>
            </div>
          )}
        </div>
        
        {station.isLive && liveService && (
          <div className="live-info">
            <h3>{liveService.title}</h3>
            {liveService.sermonTitle && <p>Sermon: {liveService.sermonTitle}</p>}
            {liveService.speaker && <p>Speaker: {liveService.speaker}</p>}
            {liveService.scripture && <p>Scripture: {liveService.scripture}</p>}
          </div>
        )}
      </section>

      {/* Services Tabs */}
      <section className="services-section">
        <div className="services-tabs">
          <button 
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming ({upcomingServices.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Services ({pastServices.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "replays" ? "active" : ""}`}
            onClick={() => setActiveTab("replays")}
          >
            Watch Replays ({replays.length})
          </button>
        </div>

        <div className="services-list">
          {activeTab === "upcoming" && (
            upcomingServices.length === 0 ? (
              <p className="no-services">No upcoming services scheduled</p>
            ) : (
              upcomingServices.map((svc) => (
                <ServiceCard key={svc._id} service={svc} formatDate={formatDate} />
              ))
            )
          )}
          
          {activeTab === "past" && (
            pastServices.length === 0 ? (
              <p className="no-services">No past services</p>
            ) : (
              pastServices.map((svc) => (
                <ServiceCard key={svc._id} service={svc} formatDate={formatDate} />
              ))
            )
          )}
          
          {activeTab === "replays" && (
            replays.length === 0 ? (
              <p className="no-services">No replays available yet</p>
            ) : (
              replays.map((svc) => (
                <ServiceCard key={svc._id} service={svc} formatDate={formatDate} showReplay />
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
}

// Service Card Component
function ServiceCard({ service, formatDate, showReplay }) {
  return (
    <div className={`service-card ${service.isLive ? "live" : ""}`}>
      {service.isLive && <span className="service-live-badge">🔴 LIVE</span>}
      
      <div className="service-main">
        <h3>{service.title}</h3>
        <div className="service-meta">
          <span className="service-date">📅 {formatDate(service.serviceDate)}</span>
          {service.serviceType && (
            <span className="service-type">{service.serviceType}</span>
          )}
        </div>
        {service.description && <p className="service-desc">{service.description}</p>}
        
        {service.sermonTitle && (
          <p className="service-sermon">
            <strong>Sermon:</strong> {service.sermonTitle}
          </p>
        )}
        {service.scripture && (
          <p className="service-scripture">
            <strong>Scripture:</strong> {service.scripture}
          </p>
        )}
        {service.speaker && (
          <p className="service-speaker">
            <strong>Speaker:</strong> {service.speaker}
          </p>
        )}
      </div>
      
      {showReplay && service.videoUrl && (
        <a 
          href={service.videoUrl} 
          target="_blank" 
          rel="noreferrer" 
          className="replay-button"
        >
          ▶ Watch Replay
        </a>
      )}
      
      {service.viewCount > 0 && (
        <span className="view-count">{service.viewCount.toLocaleString()} views</span>
      )}
    </div>
  );
}


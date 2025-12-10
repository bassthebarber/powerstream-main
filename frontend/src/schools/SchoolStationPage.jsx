// frontend/src/schools/SchoolStationPage.jsx
// PowerStream School Network - Individual School Station Page

import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import "./SchoolNetwork.css";

const API_BASE = import.meta.env.MODE === "development" 
  ? "http://localhost:5001" 
  : (import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001");

export default function SchoolStationPage() {
  const { slug } = useParams();
  const [station, setStation] = useState(null);
  const [games, setGames] = useState([]);
  const [events, setEvents] = useState([]);
  const [liveGame, setLiveGame] = useState(null);
  const [liveEvent, setLiveEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [sportFilter, setSportFilter] = useState("");
  const videoRef = useRef(null);
  const hlsRef = useRef(null);

  useEffect(() => {
    loadStation();
  }, [slug]);

  const loadStation = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/schools/stations/${slug}`);
      const data = await res.json();
      
      if (data.success) {
        setStation(data.station);
        setGames(data.games || []);
        setEvents(data.events || []);
        setLiveGame(data.liveGame);
        setLiveEvent(data.liveEvent);
      } else {
        setError(data.error || "Station not found");
      }
    } catch (err) {
      console.error("[SchoolStation] Error:", err);
      setError("Failed to load station");
    } finally {
      setLoading(false);
    }
  };

  // Setup HLS player
  useEffect(() => {
    if (!station?.hlsUrl || !videoRef.current) return;

    const video = videoRef.current;
    
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
      video.src = station.hlsUrl;
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [station]);

  // Filter games
  const sports = [...new Set(games.map(g => g.sport).filter(Boolean))];
  const filteredGames = sportFilter 
    ? games.filter(g => g.sport === sportFilter) 
    : games;
  
  const upcomingGames = filteredGames.filter(g => 
    !g.isReplayAvailable && g.result === "pending"
  );
  const completedGames = filteredGames.filter(g => 
    g.result && g.result !== "pending"
  );
  const gameReplays = filteredGames.filter(g => g.isReplayAvailable);

  // Filter events
  const upcomingEvents = events.filter(e => 
    !e.isReplayAvailable && new Date(e.eventDate) >= new Date()
  );
  const eventReplays = events.filter(e => e.isReplayAvailable);

  const formatDate = (dateStr, timeStr) => {
    const date = new Date(dateStr);
    const dateFormatted = date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    return timeStr ? `${dateFormatted} at ${timeStr}` : dateFormatted;
  };

  const formatScore = (game) => {
    if (game.finalScoreHome === undefined || game.finalScoreAway === undefined) {
      return null;
    }
    return `${game.finalScoreHome} - ${game.finalScoreAway}`;
  };

  if (loading) {
    return (
      <div className="school-wrapper">
        <div className="school-loading">
          <div className="spinner"></div>
          <span>Loading school...</span>
        </div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="school-wrapper">
        <div className="school-error">
          <h2>⚠️ {error || "Station not found"}</h2>
          <Link to="/schools" className="back-link">← Back to School Network</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="school-wrapper">
      <Link to="/schools" className="back-link">← Back to School Network</Link>
      
      {/* Header */}
      <header className="school-station-header">
        <div className="station-header-left">
          {station.logoUrl ? (
            <img src={station.logoUrl} alt={station.name} className="station-logo-large" />
          ) : (
            <div className="station-logo-placeholder-lg">
              {station.name?.charAt(0) || "S"}
            </div>
          )}
          <div className="station-info">
            <h1>{station.name}</h1>
            {station.isLive && <span className="live-indicator">🔴 LIVE NOW</span>}
            {station.mascot && <p className="station-mascot">🐾 {station.mascot}</p>}
            {station.district && <p className="station-district">{station.district}</p>}
            {station.location && <p className="station-location">📍 {station.location}</p>}
            <div className="station-badges">
              {station.colors && <span className="colors-badge">🎨 {station.colors}</span>}
              {station.classification && <span className="class-badge">{station.classification}</span>}
              {station.conference && <span className="conf-badge">{station.conference}</span>}
            </div>
          </div>
        </div>
        
        {station.description && (
          <p className="station-description">{station.description}</p>
        )}
        
        {/* Links */}
        <div className="station-links">
          {station.website && (
            <a href={station.website} target="_blank" rel="noreferrer" className="station-link">
              🌐 School Website
            </a>
          )}
          {station.athleticsUrl && (
            <a href={station.athleticsUrl} target="_blank" rel="noreferrer" className="station-link">
              🏆 Athletics
            </a>
          )}
        </div>
      </header>

      {/* Live Stream Section */}
      <section className="live-stream-section">
        <h2>
          {station.isLive ? "🔴 Live Broadcast" : "Live Stream"}
          {liveGame && ` - ${liveGame.sport} vs ${liveGame.opponent}`}
          {liveEvent && !liveGame && ` - ${liveEvent.title}`}
        </h2>
        
        <div className="video-container">
          <video
            ref={videoRef}
            controls
            playsInline
            className="school-video-player"
            poster={station.bannerUrl || station.logoUrl}
          />
          
          {!station.isLive && (
            <div className="offline-overlay">
              <span className="offline-icon">📺</span>
              <p>Not currently streaming</p>
              <p className="offline-hint">Check the schedule for upcoming games and events</p>
            </div>
          )}
        </div>
        
        {station.isLive && liveGame && (
          <div className="live-info">
            <h3>{liveGame.sport} - {liveGame.homeOrAway === "home" ? "Home" : "Away"}</h3>
            <p className="opponent">vs {liveGame.opponent} {liveGame.opponentMascot && `(${liveGame.opponentMascot})`}</p>
            {liveGame.venue && <p>📍 {liveGame.venue}</p>}
          </div>
        )}
      </section>

      {/* Games & Events Tabs */}
      <section className="content-section">
        <div className="content-tabs">
          <button 
            className={`tab-btn ${activeTab === "upcoming" ? "active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            🗓️ Upcoming ({upcomingGames.length + upcomingEvents.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "results" ? "active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            📊 Results ({completedGames.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "replays" ? "active" : ""}`}
            onClick={() => setActiveTab("replays")}
          >
            ▶️ Replays ({gameReplays.length + eventReplays.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
            onClick={() => setActiveTab("events")}
          >
            🎭 Events ({events.length})
          </button>
        </div>

        {/* Sport Filter */}
        {sports.length > 1 && activeTab !== "events" && (
          <div className="sport-filter">
            <select 
              value={sportFilter} 
              onChange={(e) => setSportFilter(e.target.value)}
            >
              <option value="">All Sports</option>
              {sports.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
        )}

        <div className="content-list">
          {/* Upcoming Games & Events */}
          {activeTab === "upcoming" && (
            <>
              {upcomingGames.length === 0 && upcomingEvents.length === 0 ? (
                <p className="no-content">No upcoming games or events scheduled</p>
              ) : (
                <>
                  {upcomingGames.map((game) => (
                    <GameCard key={game._id} game={game} formatDate={formatDate} />
                  ))}
                  {upcomingEvents.map((event) => (
                    <EventCard key={event._id} event={event} formatDate={formatDate} />
                  ))}
                </>
              )}
            </>
          )}
          
          {/* Completed Games */}
          {activeTab === "results" && (
            completedGames.length === 0 ? (
              <p className="no-content">No completed games yet</p>
            ) : (
              completedGames.map((game) => (
                <GameCard key={game._id} game={game} formatDate={formatDate} formatScore={formatScore} showResult />
              ))
            )
          )}
          
          {/* Game & Event Replays */}
          {activeTab === "replays" && (
            gameReplays.length === 0 && eventReplays.length === 0 ? (
              <p className="no-content">No replays available yet</p>
            ) : (
              <>
                {gameReplays.map((game) => (
                  <GameCard key={game._id} game={game} formatDate={formatDate} formatScore={formatScore} showReplay showResult />
                ))}
                {eventReplays.map((event) => (
                  <EventCard key={event._id} event={event} formatDate={formatDate} showReplay />
                ))}
              </>
            )
          )}
          
          {/* All Events */}
          {activeTab === "events" && (
            events.length === 0 ? (
              <p className="no-content">No events scheduled</p>
            ) : (
              events.map((event) => (
                <EventCard key={event._id} event={event} formatDate={formatDate} showReplay={event.isReplayAvailable} />
              ))
            )
          )}
        </div>
      </section>
    </div>
  );
}

// Game Card Component
function GameCard({ game, formatDate, formatScore, showResult, showReplay }) {
  const sportEmojis = {
    football: "🏈",
    basketball: "🏀",
    baseball: "⚾",
    softball: "🥎",
    soccer: "⚽",
    volleyball: "🏐",
    tennis: "🎾",
    golf: "⛳",
    swimming: "🏊",
    track: "🏃",
    wrestling: "🤼",
  };
  
  const emoji = sportEmojis[game.sport?.toLowerCase()] || "🏆";
  const score = formatScore ? formatScore(game) : null;
  
  return (
    <div className={`content-card ${game.isLive ? "live" : ""}`}>
      {game.isLive && <span className="card-live-badge">🔴 LIVE</span>}
      
      <div className="card-sport-badge">
        <span>{emoji}</span>
        <span>{game.sport}</span>
        {game.level && game.level !== "varsity" && (
          <span className="level-tag">{game.level.toUpperCase()}</span>
        )}
      </div>
      
      <div className="card-main">
        <h3>vs {game.opponent}</h3>
        {game.opponentMascot && <span className="opponent-mascot">{game.opponentMascot}</span>}
        
        <div className="card-meta">
          <span className="card-date">📅 {formatDate(game.gameDate, game.gameTime)}</span>
          <span className={`card-location ${game.homeOrAway}`}>
            {game.homeOrAway === "home" ? "🏠 Home" : "✈️ Away"}
          </span>
          {game.venue && <span className="card-venue">📍 {game.venue}</span>}
          {game.seasonLabel && <span className="card-season">{game.seasonLabel}</span>}
        </div>
        
        {showResult && score && (
          <div className="card-score">
            <span className={`result-badge ${game.result}`}>{game.result?.toUpperCase()}</span>
            <span className="score-text">{score}</span>
          </div>
        )}
      </div>
      
      {showReplay && (
        <div className="card-actions">
          {game.videoUrl && (
            <a href={game.videoUrl} target="_blank" rel="noreferrer" className="replay-button">
              ▶ Watch Replay
            </a>
          )}
          {game.highlightUrl && (
            <a href={game.highlightUrl} target="_blank" rel="noreferrer" className="highlight-button">
              ⭐ Highlights
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event, formatDate, showReplay }) {
  const eventEmojis = {
    graduation: "🎓",
    pep_rally: "📣",
    play: "🎭",
    band: "🎺",
    choir: "🎤",
    assembly: "🏛️",
    ceremony: "🏅",
    dance: "💃",
    other: "📌",
  };
  
  const emoji = eventEmojis[event.type] || "📌";
  
  return (
    <div className={`content-card event-card ${event.isLive ? "live" : ""}`}>
      {event.isLive && <span className="card-live-badge">🔴 LIVE</span>}
      
      <div className="card-event-badge">
        <span>{emoji}</span>
        <span>{event.type?.replace("_", " ")}</span>
      </div>
      
      <div className="card-main">
        <h3>{event.title}</h3>
        
        <div className="card-meta">
          <span className="card-date">📅 {formatDate(event.eventDate, event.eventTime)}</span>
          {event.venue && <span className="card-venue">📍 {event.venue}</span>}
        </div>
        
        {event.description && <p className="card-desc">{event.description}</p>}
      </div>
      
      {showReplay && event.videoUrl && (
        <div className="card-actions">
          <a href={event.videoUrl} target="_blank" rel="noreferrer" className="replay-button">
            ▶ Watch Replay
          </a>
        </div>
      )}
    </div>
  );
}




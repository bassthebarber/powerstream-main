// frontend/src/pages/MusicLibrary.jsx
// Music Library - Browse, Stream, and Discover Artists

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import "./MusicLibrary.css";

const GENRES = ["All", "Rap", "R&B", "Hip-Hop", "Gospel", "Pop", "Rock", "Jazz", "Electronic"];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "popular", label: "Most Popular" },
  { value: "artist", label: "By Artist" },
];

export default function MusicLibrary() {
  const navigate = useNavigate();
  const audioRef = useRef(null);
  
  // Data state
  const [tracks, setTracks] = useState([]);
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // Track ID to confirm delete
  
  // Filter state
  const [genre, setGenre] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Player state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(80);
  
  // View state
  const [view, setView] = useState("tracks"); // "tracks" | "artists"
  
  // Get current user ID on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await api.get("/users/me");
        if (res.data?.user?._id) {
          setCurrentUserId(res.data.user._id);
        }
      } catch {
        // Not logged in - that's ok
        setCurrentUserId(null);
      }
    };
    fetchCurrentUser();
  }, []);

  // Load tracks
  const loadTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append("sort", sortBy);
      if (genre !== "All") params.append("genre", genre);
      if (searchQuery) params.append("artist", searchQuery);
      
      const res = await api.get(`/music/tracks?${params.toString()}`);
      if (res.data?.success) {
        setTracks(res.data.data?.tracks || []);
      } else {
        setError(res.data?.message || "Failed to load tracks");
      }
    } catch (err) {
      console.error("Load tracks error:", err);
      setError("Could not load music library");
    } finally {
      setLoading(false);
    }
  };

  // Load artists
  const loadArtists = async () => {
    try {
      const res = await api.get("/music/artists");
      if (res.data?.success) {
        setArtists(res.data.data || []);
      }
    } catch (err) {
      console.error("Load artists error:", err);
    }
  };

  useEffect(() => {
    loadTracks();
    loadArtists();
  }, [genre, sortBy]);

  // Play track
  const handlePlay = async (track) => {
    if (currentTrack?._id === track._id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setCurrentTrack(track);
    setIsPlaying(true);
    
    // Register play
    try {
      await api.post(`/audio/${track._id}/play`, { secondsPlayed: 0 });
    } catch (err) {
      console.warn("Failed to register play");
    }
  };

  // Audio event handlers
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audio = audioRef.current;
    
    const handleTimeUpdate = () => {
      setProgress(audio.currentTime);
      setDuration(audio.duration || 0);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      // Auto-play next track
      const currentIndex = tracks.findIndex(t => t._id === currentTrack?._id);
      if (currentIndex < tracks.length - 1) {
        handlePlay(tracks[currentIndex + 1]);
      }
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [currentTrack, tracks]);

  // Update audio source when track changes
  useEffect(() => {
    if (currentTrack && audioRef.current) {
      audioRef.current.src = currentTrack.audioUrl;
      audioRef.current.volume = volume / 100;
      audioRef.current.play().catch(err => {
        console.error("Playback error:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  // Volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  // Format time
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Delete track (artist only)
  const handleDeleteTrack = async (trackId) => {
    try {
      const res = await api.delete(`/audio-tracks/${trackId}`);
      if (res.data?.success) {
        // Remove from local state
        setTracks(prev => prev.filter(t => t._id !== trackId));
        // If this was the current track, stop playback
        if (currentTrack?._id === trackId) {
          audioRef.current?.pause();
          setCurrentTrack(null);
          setIsPlaying(false);
        }
        setDeleteConfirm(null);
      } else {
        alert(res.data?.message || "Failed to delete track");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(err.response?.data?.message || "Failed to delete track. Make sure you own this track.");
    }
  };

  // Check if user owns track
  const isOwner = (track) => {
    if (!currentUserId) return false;
    const ownerId = track.ownerUser?._id || track.ownerUser;
    return ownerId === currentUserId;
  };

  // Seek
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioRef.current && duration) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  return (
    <div className="music-library">
      {/* Hidden audio element */}
      <audio ref={audioRef} />

      {/* Header */}
      <header className="music-header">
        <div className="music-header-content">
          <div className="music-logo">
            <span className="music-logo-icon">🎵</span>
            <div>
              <h1>PowerStream Music</h1>
              <p>Stream • Discover • Support Artists</p>
            </div>
          </div>
          <div className="music-header-actions">
            <button 
              className="music-btn music-btn--primary"
              onClick={() => navigate("/artist/upload")}
            >
              ⬆ Upload Your Music
            </button>
          </div>
        </div>
      </header>

      {/* Search & Filters */}
      <div className="music-filters">
        <div className="music-search">
          <input
            type="text"
            placeholder="Search artists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadTracks()}
          />
          <button onClick={loadTracks}>🔍</button>
        </div>
        
        <div className="music-filter-group">
          <div className="music-genres">
            {GENRES.map((g) => (
              <button
                key={g}
                className={`music-genre-btn ${genre === g ? "active" : ""}`}
                onClick={() => setGenre(g)}
              >
                {g}
              </button>
            ))}
          </div>
          
          <select 
            className="music-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        
        <div className="music-view-toggle">
          <button 
            className={view === "tracks" ? "active" : ""}
            onClick={() => setView("tracks")}
          >
            🎵 Tracks
          </button>
          <button 
            className={view === "artists" ? "active" : ""}
            onClick={() => setView("artists")}
          >
            👤 Artists
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="music-content">
        {loading ? (
          <div className="music-loading">
            <div className="music-spinner" />
            <p>Loading music library...</p>
          </div>
        ) : error ? (
          <div className="music-error">
            <p>⚠️ {error}</p>
            <button onClick={loadTracks}>Try Again</button>
          </div>
        ) : view === "tracks" ? (
          <div className="music-tracks">
            {tracks.length === 0 ? (
              <div className="music-empty">
                <div className="music-empty-icon">🎶</div>
                <h3>No tracks yet</h3>
                <p>Be the first to upload your music!</p>
                <button 
                  className="music-btn music-btn--primary"
                  onClick={() => navigate("/artist/upload")}
                >
                  Upload Now
                </button>
              </div>
            ) : (
              <div className="music-track-list">
                {tracks.map((track, index) => (
                  <div 
                    key={track._id} 
                    className={`music-track-row ${currentTrack?._id === track._id ? "playing" : ""}`}
                  >
                    <div className="music-track-num">{index + 1}</div>
                    <button 
                      className="music-track-play"
                      onClick={() => handlePlay(track)}
                    >
                      {currentTrack?._id === track._id && isPlaying ? "⏸" : "▶"}
                    </button>
                    <div className="music-track-cover">
                      {track.coverArtUrl ? (
                        <img src={track.coverArtUrl} alt={track.title} />
                      ) : (
                        <div className="music-track-cover-placeholder">🎵</div>
                      )}
                    </div>
                    <div className="music-track-info">
                      <div className="music-track-title">{track.title}</div>
                      <div className="music-track-artist">{track.artistName}</div>
                    </div>
                    <div className="music-track-album">{track.albumName || "Single"}</div>
                    <div className="music-track-genre">{track.genre || "-"}</div>
                    <div className="music-track-plays">
                      {track.playCount?.toLocaleString() || 0} plays
                    </div>
                    <div className="music-track-duration">
                      {formatTime(track.duration)}
                    </div>
                    {track.isExplicit && (
                      <span className="music-track-explicit">E</span>
                    )}
                    {/* Delete button - only for track owner */}
                    {isOwner(track) && (
                      <div className="music-track-actions">
                        {deleteConfirm === track._id ? (
                          <div className="music-delete-confirm">
                            <span style={{ fontSize: 11, color: "#ff6b6b", marginRight: 4 }}>Delete?</span>
                            <button 
                              className="music-delete-btn music-delete-btn--yes"
                              onClick={(e) => { e.stopPropagation(); handleDeleteTrack(track._id); }}
                              title="Confirm delete"
                            >
                              ✓
                            </button>
                            <button 
                              className="music-delete-btn music-delete-btn--no"
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="music-delete-btn"
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(track._id); }}
                            title="Delete track"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="music-artists">
            {artists.length === 0 ? (
              <div className="music-empty">
                <div className="music-empty-icon">👤</div>
                <h3>No artists yet</h3>
                <p>Upload your music to appear here!</p>
              </div>
            ) : (
              <div className="music-artist-grid">
                {artists.map((artist) => (
                  <div 
                    key={artist._id}
                    className="music-artist-card"
                    onClick={() => {
                      setSearchQuery(artist._id);
                      setView("tracks");
                      loadTracks();
                    }}
                  >
                    <div className="music-artist-avatar">
                      {artist._id?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="music-artist-name">{artist._id}</div>
                    <div className="music-artist-stats">
                      {artist.trackCount} tracks • {artist.totalPlays?.toLocaleString() || 0} plays
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Now Playing Bar */}
      {currentTrack && (
        <div className="music-player-bar">
          <div className="music-player-track">
            <div className="music-player-cover">
              {currentTrack.coverArtUrl ? (
                <img src={currentTrack.coverArtUrl} alt={currentTrack.title} />
              ) : (
                <div className="music-player-cover-placeholder">🎵</div>
              )}
            </div>
            <div className="music-player-info">
              <div className="music-player-title">{currentTrack.title}</div>
              <div className="music-player-artist">{currentTrack.artistName}</div>
            </div>
          </div>

          <div className="music-player-controls">
            <button 
              className="music-player-btn"
              onClick={() => {
                const idx = tracks.findIndex(t => t._id === currentTrack._id);
                if (idx > 0) handlePlay(tracks[idx - 1]);
              }}
            >
              ⏮
            </button>
            <button 
              className="music-player-btn music-player-btn--main"
              onClick={() => {
                if (isPlaying) {
                  audioRef.current?.pause();
                } else {
                  audioRef.current?.play();
                }
              }}
            >
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button 
              className="music-player-btn"
              onClick={() => {
                const idx = tracks.findIndex(t => t._id === currentTrack._id);
                if (idx < tracks.length - 1) handlePlay(tracks[idx + 1]);
              }}
            >
              ⏭
            </button>
          </div>

          <div className="music-player-progress">
            <span className="music-player-time">{formatTime(progress)}</span>
            <div 
              className="music-player-progress-bar"
              onClick={handleSeek}
            >
              <div 
                className="music-player-progress-fill"
                style={{ width: duration ? `${(progress / duration) * 100}%` : "0%" }}
              />
            </div>
            <span className="music-player-time">{formatTime(duration)}</span>
          </div>

          <div className="music-player-volume">
            <span>🔊</span>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  );
}


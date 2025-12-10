// frontend/src/nlf-tv/NLFStationHome.jsx
// No Limit Forever TV - Station Home with Ratings

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NLFRatingCompact } from "./NLFRatingStars.jsx";
import styles from "./styles/NLF.module.css";

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001";

export default function NLFStationHome() {
  const navigate = useNavigate();
  const [station, setStation] = useState(null);
  const [videos, setVideos] = useState([]);
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchStationData();
  }, []);

  useEffect(() => {
    if (station) {
      fetchVideos();
    }
  }, [activeFilter, sortBy, station]);

  const fetchStationData = async () => {
    try {
      setLoading(true);
      
      // Initialize station if needed
      await fetch(`${API_BASE}/api/nlf/init`, { method: "POST" });
      
      // Fetch station info
      const stationRes = await fetch(`${API_BASE}/api/nlf/station`);
      const stationData = await stationRes.json();
      
      if (stationData.success) {
        setStation(stationData.station);
      }

      // Fetch featured videos
      const featuredRes = await fetch(`${API_BASE}/api/nlf/videos?featured=true&limit=4`);
      const featuredData = await featuredRes.json();
      
      if (featuredData.success) {
        setFeaturedVideos(featuredData.videos);
      }

      // Fetch schedule
      const scheduleRes = await fetch(`${API_BASE}/api/nlf/schedule?upcoming=true`);
      const scheduleData = await scheduleRes.json();
      
      if (scheduleData.success) {
        setSchedule(scheduleData.schedule.slice(0, 6));
      }

      setLoading(false);
    } catch (err) {
      console.error("[NLF] Error fetching data:", err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      let url = `${API_BASE}/api/nlf/videos?limit=12&sort=${sortBy}`;
      if (activeFilter !== "all") {
        url += `&type=${activeFilter}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setVideos(data.videos);
      }
    } catch (err) {
      console.error("[NLF] Error fetching videos:", err);
    }
  };

  const handleVideoClick = (video) => {
    navigate(`/nlf/watch/${video._id}`);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (count) => {
    if (!count) return "0";
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const categories = [
    { key: "all", label: "All" },
    { key: "premiere", label: "Premieres" },
    { key: "concert", label: "Concerts" },
    { key: "documentary", label: "Documentaries" },
    { key: "interview", label: "Interviews" },
    { key: "music_video", label: "Music Videos" },
    { key: "special", label: "Specials" },
  ];

  if (loading) {
    return (
      <div className={styles.stationHome}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.stationHome}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroBg}></div>
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.logo}>
            <img 
              src="/logos/nolimit-forever-logo.png" 
              alt="No Limit Forever TV"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/180x180/FFD700/000000?text=NLF";
              }}
            />
          </div>
          
          <h1 className={styles.title}>No Limit Forever TV</h1>
          
          <p className={styles.tagline}>
            {station?.tagline || "The Official Global Broadcast Network of the No Limit Empire"}
          </p>

          {station?.isLive && (
            <div className={styles.liveIndicator}>
              🔴 LIVE NOW
            </div>
          )}

          <div className={styles.welcomeBanner}>
            <p>
              Welcome to No Limit Forever TV — Where Legends Live Forever.
              Experience exclusive premieres, legendary concerts, and behind-the-scenes content.
            </p>
          </div>

          <div className={styles.heroActions}>
            {station?.isLive ? (
              <Link to="/nlf/live" className={styles.btnPrimary}>
                Watch Live
              </Link>
            ) : (
              <Link to="/nlf/guide" className={styles.btnPrimary}>
                View Schedule
              </Link>
            )}
            <a href="#content" className={styles.btnSecondary}>
              Browse Content
            </a>
          </div>

          {/* Station Stats */}
          <div className={styles.stationStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{formatViews(station?.viewCount || 0)}</span>
              <span className={styles.statLabel}>Total Views</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{videos.length}</span>
              <span className={styles.statLabel}>Videos</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>
                {station?.averageRating ? station.averageRating.toFixed(1) : "—"}
              </span>
              <span className={styles.statLabel}>Rating</span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      {featuredVideos.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>⭐ Featured Content</h2>
          </div>
          
          <div className={styles.contentGrid}>
            {featuredVideos.map((video) => (
              <div
                key={video._id}
                className={`${styles.videoCard} ${styles.featuredCard}`}
                onClick={() => handleVideoClick(video)}
              >
                <div className={styles.cardThumbnail}>
                  <img
                    src={video.thumbnailUrl || "https://via.placeholder.com/400x225/1a1a1a/FFD700?text=NLF"}
                    alt={video.title}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/400x225/1a1a1a/FFD700?text=NLF";
                    }}
                  />
                  <span className={`${styles.cardBadge} ${styles.badgeFeatured}`}>
                    Featured
                  </span>
                  <div className={styles.playButton}></div>
                  {video.duration > 0 && (
                    <span className={styles.durationBadge}>
                      {formatDuration(video.duration)}
                    </span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardType}>{video.type}</div>
                  <h3 className={styles.cardTitle}>{video.title}</h3>
                  {video.artist && (
                    <p className={styles.cardArtist}>{video.artist}</p>
                  )}
                  <div className={styles.cardFooter}>
                    <NLFRatingCompact rating={video.rating} count={video.ratingCount} />
                    <span className={styles.viewCount}>{formatViews(video.views)} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Browse Content */}
      <section id="content" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>🎬 Browse Content</h2>
          <div className={styles.sortSelect}>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>
        </div>

        {/* Category Filters */}
        <div className={styles.filterBar}>
          {categories.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.filterBtn} ${activeFilter === cat.key ? styles.filterActive : ""}`}
              onClick={() => setActiveFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        
        <div className={styles.contentGrid}>
          {videos.map((video) => (
            <div
              key={video._id}
              className={styles.videoCard}
              onClick={() => handleVideoClick(video)}
            >
              <div className={styles.cardThumbnail}>
                <img
                  src={video.thumbnailUrl || "https://via.placeholder.com/400x225/1a1a1a/FFD700?text=NLF"}
                  alt={video.title}
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x225/1a1a1a/FFD700?text=NLF";
                  }}
                />
                {video.isPremiere && (
                  <span className={`${styles.cardBadge} ${styles.badgePremiere}`}>
                    Premiere
                  </span>
                )}
                {video.isExclusive && !video.isPremiere && (
                  <span className={`${styles.cardBadge} ${styles.badgeExclusive}`}>
                    Exclusive
                  </span>
                )}
                <div className={styles.playButton}></div>
                {video.duration > 0 && (
                  <span className={styles.durationBadge}>
                    {formatDuration(video.duration)}
                  </span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardType}>{video.type}</div>
                <h3 className={styles.cardTitle}>{video.title}</h3>
                {video.artist && (
                  <p className={styles.cardArtist}>{video.artist}</p>
                )}
                <div className={styles.cardFooter}>
                  <NLFRatingCompact rating={video.rating} count={video.ratingCount} />
                  <span className={styles.viewCount}>{formatViews(video.views)} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {videos.length === 0 && (
          <div className={styles.emptyState}>
            <p>No videos found in this category.</p>
          </div>
        )}
      </section>

      {/* Schedule */}
      {schedule.length > 0 && (
        <section className={`${styles.section} ${styles.scheduleSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>📅 Upcoming Schedule</h2>
            <Link to="/nlf/guide" className={styles.viewAll}>
              Full Schedule →
            </Link>
          </div>
          
          <div className={styles.scheduleGrid}>
            {schedule.map((item, index) => (
              <div key={index} className={styles.scheduleItem}>
                <div className={styles.scheduleTime}>
                  {formatTime(item.startTime)}
                </div>
                <div className={styles.scheduleInfo}>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </div>
                <span className={styles.scheduleType}>{item.type}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Category Browse */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>📚 Explore Categories</h2>
        </div>
        
        <div className={styles.categoryGrid}>
          {[
            { type: "premiere", icon: "🎬", label: "Premieres", color: "#FFD700" },
            { type: "concert", icon: "🎤", label: "Concerts", color: "#FF4500" },
            { type: "documentary", icon: "🎥", label: "Documentaries", color: "#7B2CBF" },
            { type: "interview", icon: "🎙️", label: "Interviews", color: "#00CED1" },
            { type: "music_video", icon: "🎵", label: "Music Videos", color: "#FF1493" },
            { type: "special", icon: "⭐", label: "Specials", color: "#FFD700" },
          ].map((cat) => (
            <button
              key={cat.type}
              className={styles.categoryCard}
              onClick={() => setActiveFilter(cat.type)}
              style={{ "--cat-color": cat.color }}
            >
              <span className={styles.categoryIcon}>{cat.icon}</span>
              <span className={styles.categoryLabel}>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

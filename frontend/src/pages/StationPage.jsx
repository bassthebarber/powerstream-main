// frontend/src/pages/StationPage.jsx
// Upgraded TV Station Page with full video experience + Broadcast Empire Pack
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import TVFeaturedBanner from "../components/tv/TVFeaturedBanner";
import TVPlaylistRow from "../components/tv/TVPlaylistRow";
import TVUploadModal from "../components/tv/TVUploadModal";
import StationLiveIndicator from "../components/tv/StationLiveIndicator";
import useCountdown from "../hooks/useCountdown";
import { fetchStationSchedule, fetchLiveStatus, setLiveOverride } from "../api/broadcastApi";
import styles from "../components/tv/TVStation.module.css";

const StationPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();

  // State
  const [station, setStation] = useState(null);
  const [videos, setVideos] = useState([]);
  const [featuredVideo, setFeaturedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Broadcast Empire Pack state
  const [broadcastEvents, setBroadcastEvents] = useState([]);
  const [liveStatus, setLiveStatus] = useState({ isLive: false, liveEvent: null });

  // Compute next upcoming event
  const nextEvent = useMemo(() => {
    const now = new Date();
    return broadcastEvents.find(e => 
      e.status === 'scheduled' && new Date(e.startsAt) > now
    );
  }, [broadcastEvents]);

  // Countdown for next scheduled show
  const countdown = useCountdown(nextEvent?.startsAt ? new Date(nextEvent.startsAt) : null, {
    autoStart: true,
    onComplete: () => {
      console.log("Next show starting!");
      // Refresh live status
      loadBroadcastData();
    }
  });

  // Load station data
  const loadStation = useCallback(async () => {
    if (!slug) {
      setError("No station specified");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/tv/stations/${slug}`);
      
      if (res.data?.ok && res.data.station) {
        setStation(res.data.station);
      } else if (res.data?.station) {
        setStation(res.data.station);
      } else {
        setError("Station not found");
      }
    } catch (err) {
      console.error("Failed to load station:", err);
      setError(err.response?.data?.message || "Failed to load station");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  // Load station videos
  const loadVideos = useCallback(async () => {
    if (!slug) return;

    try {
      const res = await api.get(`/tv/stations/${slug}/videos`);
      const videoList = res.data?.videos || [];
      setVideos(videoList);
      
      // Set featured video (first video or live video)
      const liveVideo = videoList.find(v => v.isLive);
      setFeaturedVideo(liveVideo || videoList[0] || null);
    } catch (err) {
      console.error("Failed to load videos:", err);
    }
  }, [slug]);

  // Load broadcast data (schedule + live status)
  const loadBroadcastData = useCallback(async () => {
    if (!slug) return;

    try {
      const [scheduleRes, liveRes] = await Promise.all([
        fetchStationSchedule(slug).catch(() => ({ ok: false })),
        fetchLiveStatus(slug).catch(() => ({ ok: false }))
      ]);

      if (scheduleRes.ok) {
        setBroadcastEvents(scheduleRes.events || []);
      }

      if (liveRes.ok) {
        setLiveStatus({
          isLive: liveRes.isLive,
          liveEvent: liveRes.liveEvent
        });
      }
    } catch (err) {
      console.error("Failed to load broadcast data:", err);
    }
  }, [slug]);

  // Initial load
  useEffect(() => {
    loadStation();
    loadVideos();
    loadBroadcastData();
  }, [loadStation, loadVideos, loadBroadcastData]);

  // Handle video selection
  const handleVideoSelect = (video) => {
    setFeaturedVideo(video);
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle upload complete
  const handleUploadComplete = (newVideo) => {
    setVideos(prev => [newVideo, ...prev]);
    if (!featuredVideo) {
      setFeaturedVideo(newVideo);
    }
  };

  // Handle video end - auto-play next
  const handleVideoEnd = () => {
    const currentIndex = videos.findIndex(v => v._id === featuredVideo?._id);
    if (currentIndex >= 0 && currentIndex < videos.length - 1) {
      setFeaturedVideo(videos[currentIndex + 1]);
    }
  };

  // Handle go live
  const handleGoLive = async () => {
    if (!broadcastEvents.length) {
      alert("No broadcast events available. Create one first!");
      return;
    }
    try {
      const candidate = broadcastEvents[0]; // Use first scheduled event
      await setLiveOverride(slug, candidate._id, true);
      const updated = await fetchLiveStatus(slug);
      setLiveStatus({
        isLive: updated.isLive,
        liveEvent: updated.liveEvent
      });
    } catch (err) {
      console.error("Failed to go live:", err);
      alert("Failed to go live: " + err.message);
    }
  };

  // Handle stop live
  const handleStopLive = async () => {
    try {
      await setLiveOverride(slug, null, false);
      const updated = await fetchLiveStatus(slug);
      setLiveStatus({
        isLive: updated.isLive,
        liveEvent: updated.liveEvent
      });
    } catch (err) {
      console.error("Failed to stop live:", err);
      alert("Failed to stop live: " + err.message);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.tvStationPage}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Loading station...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !station) {
    return (
      <div className={styles.tvStationPage}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>📺</div>
          <h2>Station Not Found</h2>
          <p>{error || "The requested station could not be loaded."}</p>
          <p className={styles.errorSlug}>Slug: {slug}</p>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/tvguide')}
          >
            ← Back to TV Guide
          </button>
        </div>
      </div>
    );
  }

  const stationName = station.name || "PowerStream TV";
  const accentColor = station.theme?.accentColor || "#FFD700";

  return (
    <div 
      className={styles.tvStationPage}
      style={{ '--station-accent': accentColor }}
    >
      {/* Header */}
      <header className={styles.tvHeader}>
        <button 
          className={styles.backButton}
          onClick={() => navigate('/tvguide')}
        >
          ← TV Guide
        </button>
        
        <img
          src={station.logoUrl || "/logos/powerstream-logo.png"}
          alt={stationName}
          className={styles.tvLogo}
          onError={(e) => {
            e.target.src = "/logos/powerstream-logo.png";
          }}
        />
        
        <div className={styles.tvTitleBlock}>
          <div className={styles.tvTitle}>{stationName}</div>
          <div className={styles.tvSubtitle}>
            {station.description || station.network || "PowerStream TV Network"}
          </div>
        </div>

        <div className={styles.tvHeaderActions}>
          {/* Live indicator from broadcast */}
          {liveStatus.isLive && (
            <div className={styles.badgeLive}>
              <span className={styles.badgeLiveDot} />
              LIVE
            </div>
          )}
          
          {/* Next show countdown */}
          {!liveStatus.isLive && nextEvent && countdown.totalMs > 0 && (
            <div className={styles.nextShowBadge}>
              Next: {countdown.formatted?.short || '--:--'}
            </div>
          )}

          {/* Upload button */}
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => setShowUploadModal(true)}
          >
            ⬆ Upload
          </button>

          {/* Control Room Link */}
          <Link 
            to={`/broadcast/control/${slug}`}
            className={styles.uploadButton}
            style={{ textDecoration: 'none' }}
          >
            📡 Control
          </Link>
        </div>
      </header>

      {/* Station Live Indicator - Below Header */}
      <StationLiveIndicator
        liveEvent={liveStatus.liveEvent}
        isLive={liveStatus.isLive}
        onClickGoLive={handleGoLive}
        onClickStopLive={handleStopLive}
      />

      {/* Main Content */}
      <main className={styles.contentGrid}>
        {/* Featured Video Section */}
        <section className={styles.mainColumn}>
          <TVFeaturedBanner
            video={featuredVideo}
            stationName={stationName}
            isLive={station.isLive}
            onVideoEnd={handleVideoEnd}
            autoPlay={false}
          />

          {/* Station Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statItem}>
              <span className={styles.statIcon}>🎬</span>
              <span className={styles.statValue}>{videos.length}</span>
              <span className={styles.statLabel}>Videos</span>
            </div>
            {station.subscribers && (
              <div className={styles.statItem}>
                <span className={styles.statIcon}>👥</span>
                <span className={styles.statValue}>
                  {station.subscribers.toLocaleString()}
                </span>
                <span className={styles.statLabel}>Subscribers</span>
              </div>
            )}
            {station.totalViews && (
              <div className={styles.statItem}>
                <span className={styles.statIcon}>👁</span>
                <span className={styles.statValue}>
                  {station.totalViews.toLocaleString()}
                </span>
                <span className={styles.statLabel}>Views</span>
              </div>
            )}
          </div>
        </section>

        {/* Playlist Sidebar */}
        <aside className={styles.sideColumn}>
          <TVPlaylistRow
            videos={videos}
            activeId={featuredVideo?._id ? String(featuredVideo._id) : null}
            onSelect={handleVideoSelect}
            title="📺 On-Demand"
            emptyMessage={`No videos on ${stationName} yet. Upload your first broadcast!`}
          />
        </aside>
      </main>

      {/* Upload Modal */}
      <TVUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        stationSlug={slug}
        stationName={stationName}
        onUploaded={handleUploadComplete}
      />
    </div>
  );
};

export default StationPage;


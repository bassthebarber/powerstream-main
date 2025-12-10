// frontend/src/components/tv/StationPage.jsx
// TV Station Page - Displays station info and videos
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import './tv.css';

const StationPage = ({ slug: propSlug }) => {
  const params = useParams();
  const navigate = useNavigate();
  const slug = propSlug || params.slug;
  
  const [station, setStation] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  // Load station data
  useEffect(() => {
    if (!slug) {
      setError('No station specified');
      setLoading(false);
      return;
    }

    const fetchStation = async () => {
      try {
        const res = await api.get(`/tv/stations/${slug}`);
        
        // Handle different response formats
        if (res.data?.ok && res.data.station) {
          setStation(res.data.station);
        } else if (res.data?.success && res.data.data) {
          setStation(res.data.data);
        } else if (res.data?.station) {
          setStation(res.data.station);
        } else {
          setError('Station not found');
        }
      } catch (err) {
        console.error('Failed to load station', err);
        setError('Station not found');
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [slug]);

  // Load station videos
  useEffect(() => {
    if (!slug) return;

    const loadVideos = async () => {
      try {
        const res = await api.get(`/tv/stations/${slug}/videos`);
        const videoList = res.data?.videos || [];
        setVideos(videoList);
        if (videoList.length > 0 && !activeVideo) {
          setActiveVideo(videoList[0]);
        }
      } catch (err) {
        console.error('Playlist load error:', err);
      }
    };

    loadVideos();
  }, [slug]);

  if (loading) {
    return (
      <div className="station-page-loading">
        <div className="tv-loading-spinner" />
        <p>Loading station...</p>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="station-page-error">
        <h2>Station Not Found</h2>
        <p>{error || 'The requested station could not be loaded.'}</p>
        <p className="station-slug-debug">Slug: {slug}</p>
        <button onClick={() => navigate('/tvguide')}>
          ← Back to TV Guide
        </button>
      </div>
    );
  }

  const bgColor = station.theme?.backgroundColor || '#000000';
  const accentColor = station.theme?.accentColor || '#FFD700';
  const displayName = station.name || 'Unknown Station';

  return (
    <div
      className="station-page"
      style={{
        '--station-bg': bgColor,
        '--station-accent': accentColor,
        backgroundColor: bgColor
      }}
    >
      <header className="station-header">
        <button className="station-back-btn" onClick={() => navigate('/tvguide')}>
          ← TV Guide
        </button>
        <div className="station-header-content">
          {station.logoUrl ? (
            <img
              src={station.logoUrl}
              alt={displayName}
              className="station-header-logo"
            />
          ) : (
            <div className="station-header-logo-placeholder">
              {displayName.charAt(0)}
            </div>
          )}
          <div className="station-header-info">
            <h1 className="station-header-title">{displayName}</h1>
            {station.description && (
              <p className="station-header-description">
                {station.description}
              </p>
            )}
            {station.isLive && (
              <span className="station-live-badge">
                <span className="station-live-dot" />
                LIVE NOW
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="station-content">
        <div className="station-main-column">
          {/* Featured Video Player */}
          {activeVideo ? (
            <div className="station-featured-video">
              <div className="station-video-wrapper">
                <video
                  key={activeVideo._id}
                  src={activeVideo.videoUrl || activeVideo.url}
                  poster={activeVideo.thumbnailUrl || activeVideo.thumbnail}
                  controls
                  autoPlay={false}
                />
              </div>
              <div className="station-video-meta">
                <h2>{activeVideo.title}</h2>
                {activeVideo.description && (
                  <p>{activeVideo.description}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="station-no-video">
              <div className="station-no-video-icon">📺</div>
              <h3>No Videos Yet</h3>
              <p>Check back soon for new content!</p>
            </div>
          )}

          {/* Video Grid */}
          <div className="station-videos">
            <h2 className="playlist-title">🎬 On-Demand Videos</h2>
            {videos.length === 0 ? (
              <div className="playlist-empty">
                <p>No videos uploaded yet.</p>
                <p className="playlist-empty-sub">Check back for new content.</p>
              </div>
            ) : (
              <div className="video-grid">
                {videos.map((v) => (
                  <div 
                    key={v._id} 
                    className={`video-card ${activeVideo?._id === v._id ? 'video-card-active' : ''}`}
                    onClick={() => setActiveVideo(v)}
                  >
                    <div className="video-card-thumbnail">
                      <img
                        src={v.thumbnailUrl || v.thumbnail || '/placeholder-video.jpg'}
                        alt={v.title}
                      />
                      {v.durationSeconds > 0 && (
                        <span className="video-card-duration">
                          {Math.floor(v.durationSeconds / 60)}:{String(v.durationSeconds % 60).padStart(2, '0')}
                        </span>
                      )}
                    </div>
                    <div className="video-card-info">
                      <h4 className="video-card-title">{v.title}</h4>
                      {v.description && (
                        <p className="video-card-description">
                          {v.description.slice(0, 60)}
                          {v.description.length > 60 ? '...' : ''}
                        </p>
                      )}
                      {v.uploadedAt && (
                        <span className="video-card-date">
                          {new Date(v.uploadedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default StationPage;

// frontend/src/components/tv/TVGuide.jsx
// TV Guide - Shows all 5 stations
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import './tv.css';

// Official station slugs
const STATION_SLUGS = [
  'southern-power-network',
  'NoLimitEastHouston',
  'texas-got-talent',
  'civic-connect',
  'worldwide-tv',
  'no-limit-forever-tv'
];

// Featured station card for No Limit Forever TV (special styling)
const NLF_FEATURED_STATION = {
  _id: 'no-limit-forever-tv',
  slug: 'no-limit-forever-tv',
  name: 'No Limit Forever TV',
  description: 'Exclusive films, documentaries, specials, and music cinema from No Limit Records.',
  logoUrl: '/logos/no-limit-forever.png',
  network: 'No Limit Forever',
  isLive: false,
  theme: { accentColor: '#FFD700' },
  isFeatured: true,
  specialRoute: '/network/no-limit-forever'
};

const TVGuide = () => {
  const navigate = useNavigate();
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await api.get('/tv/stations');
        
        // Handle different response formats
        let stationList = [];
        if (res.data?.ok && res.data.stations) {
          stationList = res.data.stations;
        } else if (res.data?.success && res.data.data) {
          stationList = res.data.data;
        } else if (Array.isArray(res.data)) {
          stationList = res.data;
        } else if (res.data?.stations) {
          stationList = res.data.stations;
        }
        
        // Add No Limit Forever TV as a featured station
        const allStations = [NLF_FEATURED_STATION, ...stationList];
        setStations(allStations);
      } catch (err) {
        console.error('Failed to load stations', err);
        setError('Failed to load TV stations');
        // Still show featured stations even on error
        setStations([NLF_FEATURED_STATION]);
      } finally {
        setLoading(false);
      }
    };

    fetchStations();
  }, []);

  const handleStationClick = (station) => {
    // Check for special route (like No Limit Forever TV)
    if (station.specialRoute) {
      navigate(station.specialRoute);
    } else {
      navigate(`/tv/stations/${station.slug}`);
    }
  };

  if (loading) {
    return (
      <div className="tv-guide-loading">
        <div className="tv-loading-spinner" />
        <p>Loading TV Guide...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tv-guide-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="tv-guide">
      <header className="tv-guide-header">
        <h1 className="tv-guide-title">⚡ PowerStream TV Guide</h1>
        <p className="tv-guide-subtitle">
          Browse stations and jump directly into live and recorded content.
        </p>
      </header>

      {stations.length === 0 ? (
        <div className="tv-guide-empty">
          <p>No stations available yet.</p>
          <p className="tv-guide-empty-sub">
            Check back soon or contact an admin to seed the stations.
          </p>
        </div>
      ) : (
        <div className="tv-guide-grid">
          {stations.map((station) => (
            <div
              key={station._id || station.slug}
              className={`tv-station-card ${station.isFeatured ? 'tv-station-card--featured' : ''}`}
              onClick={() => handleStationClick(station)}
              style={{
                '--accent': station.theme?.accentColor || '#FFD700'
              }}
            >
              <div className="tv-station-card-logo">
                {station.logoUrl ? (
                  <img
                    src={station.logoUrl}
                    alt={station.name}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  className="tv-station-card-logo-fallback"
                  style={{ display: station.logoUrl ? 'none' : 'flex' }}
                >
                  {station.name?.charAt(0) || '?'}
                </div>
              </div>
              
              <div className="tv-station-card-info">
                <h3 className="tv-station-card-name">{station.name}</h3>
                {station.description && (
                  <p className="tv-station-card-description">
                    {station.description.slice(0, 80)}
                    {station.description.length > 80 ? '...' : ''}
                  </p>
                )}
                
                <div className="tv-station-card-badges">
                  {station.isLive && (
                    <span className="tv-badge-live">
                      <span className="tv-badge-live-dot" />
                      LIVE
                    </span>
                  )}
                  <span className="tv-badge-network">
                    {station.network || 'PowerStream'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TVGuide;

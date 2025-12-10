import { useEffect, useState } from 'react';
import api from '../lib/api';
import './NoLimitAudio.css';

const STATION_KEY = 'no-limit-east-houston';

const NoLimitAudio = () => {
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);

  const loadTracks = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/stations/${STATION_KEY}/audio`);
      if (res.data?.success) {
        setTracks(res.data.data || []);
      } else {
        setError(res.data?.message || 'Failed to load tracks');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load tracks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handlePlay = async (track) => {
    setCurrentTrack(track);
    try {
      await api.post(`/audio/${track._id}/play`, {
        secondsPlayed: track.duration || 0
      });
      // optimistically bump play count
      setTracks((prev) =>
        prev.map((t) =>
          t._id === track._id
            ? { ...t, playCount: (t.playCount || 0) + 1 }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to register play', err);
    }
  };

  return (
    <div className="nle-audio-page">
      <header className="nle-header">
        <img
          src="/logos/nolimit-forever-logo.png"
          alt="No Limit East Houston"
          className="nle-logo"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div>
          <h1>No Limit East Houston – Audio Station</h1>
          <p>Upload, stream, and discover No Limit artists.</p>
        </div>
      </header>

      <div className="nle-layout">
        <section className="nle-list">
          <h2>Tracks</h2>
          {loading && <div className="nle-loading">Loading tracks…</div>}
          {error && <div className="nle-error">{error}</div>}
          {!loading && !error && tracks.length === 0 && (
            <div className="nle-empty">No tracks have been published yet.</div>
          )}
          {tracks.length > 0 && (
            <table className="nle-table">
              <thead>
                <tr>
                  <th>Artist</th>
                  <th>Track</th>
                  <th>Release Date</th>
                  <th>Plays</th>
                  <th>Play</th>
                </tr>
              </thead>
              <tbody>
                {tracks.map((t) => (
                  <tr key={t._id} className={currentTrack?._id === t._id ? 'nle-active' : ''}>
                    <td>{t.artistName}</td>
                    <td>{t.title}</td>
                    <td>
                      {t.releaseDate
                        ? new Date(t.releaseDate).toLocaleDateString()
                        : '-'}
                    </td>
                    <td>{t.playCount || 0}</td>
                    <td>
                      <button 
                        className="nle-play-btn"
                        onClick={() => handlePlay(t)}
                      >
                        ▶
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="nle-player">
          <h2>Now Playing</h2>
          {currentTrack ? (
            <div className="nle-now-playing">
              <div className="nle-now-title">
                {currentTrack.artistName} – {currentTrack.title}
              </div>
              <audio
                key={currentTrack._id}
                controls
                autoPlay
                src={currentTrack.audioUrl}
                style={{ width: '100%' }}
              />
            </div>
          ) : (
            <p className="nle-no-track">Select a track to start listening.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default NoLimitAudio;

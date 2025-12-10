// frontend/src/components/tv/StreamPlayer.jsx
// Golden TV Subsystem - Stream Player Component
import './tv.css';

const StreamPlayer = ({ src, title, isLive = false }) => {
  if (!src) {
    return (
      <div className="stream-player-empty">
        <div className="stream-player-placeholder">
          <span className="stream-player-placeholder-icon">📺</span>
          <p>No stream available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stream-player">
      {title && (
        <div className="stream-player-header">
          {isLive && <span className="live-badge live-badge-live">● LIVE</span>}
          <h3 className="stream-player-title">{title}</h3>
        </div>
      )}
      <div className="stream-player-container">
        <video
          className="stream-player-video"
          src={src}
          controls
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
};

export default StreamPlayer;




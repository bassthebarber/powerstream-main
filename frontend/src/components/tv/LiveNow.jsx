// frontend/src/components/tv/LiveNow.jsx
// Golden TV Subsystem - Live Now Component
import './tv.css';

const LiveNow = ({ liveStream }) => {
  if (!liveStream || !liveStream.liveUrl) {
    return (
      <div className="live-now-empty">
        <div className="live-now-header">
          <span className="live-badge live-badge-offline">OFFLINE</span>
          <h3>Live Broadcast</h3>
        </div>
        <div className="live-now-placeholder">
          <div className="live-now-placeholder-icon">📺</div>
          <p>No live broadcast at this moment.</p>
          <p className="live-now-placeholder-sub">Check back soon for live content!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-now">
      <div className="live-now-header">
        <span className="live-badge live-badge-live">● LIVE</span>
        <h3>Live Now</h3>
      </div>
      
      <div className="live-now-player-container">
        <video
          className="live-now-video"
          src={liveStream.liveUrl}
          controls
          autoPlay
          playsInline
        />
      </div>
      
      {liveStream.startedAt && (
        <p className="live-now-meta">
          Live since {new Date(liveStream.startedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
};

export default LiveNow;



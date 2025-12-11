// frontend/src/components/tv/RecordedContent.jsx
// Golden TV Subsystem - Recorded Content / VOD Shelf Component
import { useState } from 'react';
import './tv.css';

const RecordedContent = ({ videos }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  if (!videos || videos.length === 0) {
    return (
      <div className="vod-empty">
        <h3>📚 Video Library</h3>
        <div className="vod-empty-content">
          <div className="vod-empty-icon">🎬</div>
          <p>No recorded content available for this station yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vod-section">
      <h3>📚 Video Library</h3>
      
      {selectedVideo && (
        <div className="vod-player-modal" onClick={() => setSelectedVideo(null)}>
          <div className="vod-player-container" onClick={(e) => e.stopPropagation()}>
            <button className="vod-player-close" onClick={() => setSelectedVideo(null)}>
              ✕
            </button>
            <h4>{selectedVideo.title}</h4>
            <video
              src={selectedVideo.videoUrl}
              className="vod-player-video"
              controls
              autoPlay
            />
            {selectedVideo.description && (
              <p className="vod-player-description">{selectedVideo.description}</p>
            )}
          </div>
        </div>
      )}

      <div className="vod-grid">
        {videos.map((video) => (
          <div 
            key={video._id} 
            className="vod-card"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="vod-thumbnail-container">
              {video.thumbnailUrl ? (
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className="vod-thumbnail"
                />
              ) : (
                <div className="vod-thumbnail-placeholder">
                  <span>▶</span>
                </div>
              )}
              <div className="vod-play-overlay">
                <span className="vod-play-icon">▶</span>
              </div>
              {video.category && (
                <span className="vod-category-badge">{video.category}</span>
              )}
            </div>
            <div className="vod-info">
              <h4 className="vod-title">{video.title}</h4>
              {video.description && (
                <p className="vod-description">{video.description}</p>
              )}
              <p className="vod-date">
                {new Date(video.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecordedContent;



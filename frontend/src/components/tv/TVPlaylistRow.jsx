// frontend/src/components/tv/TVPlaylistRow.jsx
// Playlist row component for TV station pages
import React from "react";
import styles from "./TVStation.module.css";

const TVPlaylistRow = ({ 
  videos = [], 
  activeId, 
  onSelect,
  title = "Station Playlist",
  emptyMessage = "No videos yet. Upload your first broadcast to start your library."
}) => {
  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Format relative date
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.playlistPanel}>
      <div className={styles.playlistHeaderRow}>
        <div className={styles.playlistTitle}>{title}</div>
        <div className={styles.playlistCount}>
          {videos.length} video{videos.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className={styles.playlistScroll}>
        {videos.length === 0 ? (
          <div className={styles.emptyState}>
            {emptyMessage}
          </div>
        ) : (
          videos.map((video) => {
            const isActive = activeId === String(video._id);
            const poster = video.thumbnailUrl || video.thumbnail || `${video.videoUrl || video.url}#t=1`;
            const duration = formatDuration(video.durationSeconds || video.duration);

            return (
              <div
                key={video._id}
                className={
                  isActive
                    ? `${styles.playlistItem} ${styles.playlistItemActive}`
                    : styles.playlistItem
                }
                onClick={() => onSelect && onSelect(video)}
              >
                <div className={styles.thumbWrapper}>
                  <img 
                    src={poster} 
                    alt={video.title || "Video"} 
                    className={styles.thumb}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  {video.isLive && (
                    <span className={styles.thumbBadge}>🔴 LIVE</span>
                  )}
                  {duration && !video.isLive && (
                    <span className={styles.thumbDuration}>{duration}</span>
                  )}
                  {isActive && (
                    <div className={styles.thumbPlaying}>
                      <span>▶</span>
                    </div>
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemTitle}>
                    {video.title || "Untitled Broadcast"}
                  </div>
                  <div className={styles.itemMeta}>
                    {video.description 
                      ? video.description.slice(0, 60) + (video.description.length > 60 ? "..." : "")
                      : formatDate(video.uploadedAt || video.createdAt)
                    }
                  </div>
                  {video.views > 0 && (
                    <div className={styles.itemViews}>
                      👁 {video.views.toLocaleString()} views
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TVPlaylistRow;

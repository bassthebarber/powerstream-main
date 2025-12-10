import React from "react";
import styles from "./TVStation.module.css";

const FeaturedVideoBanner = ({ video, stationName }) => {
  if (!video) {
    return (
      <div className={styles.featuredCard}>
        <div className={styles.featuredMeta}>
          <div className={styles.featuredTitle}>No videos yet</div>
          <div className={styles.featuredDescription}>
            Upload your first broadcast to feature it here on the Southern Power Network.
          </div>
        </div>
      </div>
    );
  }

  const poster = video.thumbnail || `${video.url}#t=1`;

  return (
    <div className={styles.featuredCard}>
      <div className={styles.featuredVideoWrapper}>
        <video
          className={styles.featuredVideo}
          src={video.url}
          poster={poster}
          controls
        />
        <div className={styles.featuredOverlay} />
      </div>

      <div className={styles.featuredMeta}>
        <div className={styles.featuredTitle}>{video.title || "Untitled Broadcast"}</div>
        <div className={styles.featuredDescription}>
          {video.description || `Streaming on ${stationName || "Southern Power Network"}`}
        </div>
        <div className={styles.metaRow}>
          <span className={styles.metaChip}>Now Playing</span>
          <span className={styles.metaChip}>On Demand</span>
        </div>
      </div>
    </div>
  );
};

export default FeaturedVideoBanner;




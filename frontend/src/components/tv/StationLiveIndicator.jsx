// frontend/src/components/tv/StationLiveIndicator.jsx
// Broadcast Empire Pack - Live status indicator for TV stations
import React from 'react';
import styles from './TVStation.module.css';

/**
 * StationLiveIndicator - Shows LIVE badge + status on StationPage
 * 
 * @param {Object} props
 * @param {Object|null} props.liveEvent - The currently live event (may be null)
 * @param {boolean} props.isLive - Whether the station is currently live
 * @param {Function} [props.onClickGoLive] - Callback when "Go Live" is clicked
 * @param {Function} [props.onClickStopLive] - Callback when "Stop Live" is clicked
 */
const StationLiveIndicator = ({ 
  liveEvent = null, 
  isLive = false, 
  onClickGoLive,
  onClickStopLive 
}) => {
  return (
    <div className={styles.liveIndicatorContainer}>
      {isLive && liveEvent ? (
        // LIVE STATE
        <div className={styles.liveIndicatorActive}>
          <div className={styles.liveBadge}>
            <span className={styles.liveDot} />
            LIVE
          </div>
          <div className={styles.liveEventInfo}>
            <span className={styles.liveEventTitle}>{liveEvent.title}</span>
            {liveEvent.type && (
              <span className={styles.liveEventType}>{liveEvent.type}</span>
            )}
          </div>
          {onClickStopLive && (
            <button 
              type="button"
              className={styles.stopLiveButton}
              onClick={onClickStopLive}
            >
              ⏹ End Live
            </button>
          )}
        </div>
      ) : (
        // OFFLINE STATE
        <div className={styles.liveIndicatorOffline}>
          <div className={styles.offlineBadge}>
            <span className={styles.offlineDot} />
            Offline
          </div>
          {onClickGoLive && (
            <button 
              type="button"
              className={styles.goLiveButton}
              onClick={onClickGoLive}
            >
              🔴 Go Live
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default StationLiveIndicator;




// frontend/src/components/tv/BroadcastControlRoom.jsx
// Broadcast Empire Pack - Admin control room for managing broadcast schedules
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchStationSchedule,
  createBroadcastEvent,
  updateBroadcastEvent,
  deleteBroadcastEvent,
  fetchLiveStatus,
  setLiveOverride
} from '../../api/broadcastApi.js';
import useCountdown from '../../hooks/useCountdown.js';
import styles from './TVStation.module.css';

/**
 * BroadcastControlRoom - Admin page for managing broadcast schedules
 * Can be used as a standalone page or embedded in StationPage
 */
const BroadcastControlRoom = ({ stationSlug: propSlug }) => {
  const { slug: paramSlug } = useParams();
  const slug = propSlug || paramSlug;

  // State
  const [station, setStation] = useState(null);
  const [events, setEvents] = useState([]);
  const [liveStatus, setLiveStatus] = useState({ isLive: false, liveEvent: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'vod',
    videoUrl: '',
    thumbnailUrl: '',
    startsAt: '',
    endsAt: '',
    isFeatured: false
  });

  // Find next upcoming event
  const nextEvent = events.find(e => 
    e.status === 'scheduled' && new Date(e.startsAt) > new Date()
  );

  // Countdown to next event
  const countdown = useCountdown(nextEvent?.startsAt ? new Date(nextEvent.startsAt) : null, {
    autoStart: true
  });

  // Load data
  const loadData = useCallback(async () => {
    if (!slug) return;
    
    try {
      setLoading(true);
      setError(null);

      const [scheduleRes, liveRes] = await Promise.all([
        fetchStationSchedule(slug),
        fetchLiveStatus(slug)
      ]);

      if (scheduleRes.ok) {
        setStation(scheduleRes.station);
        setEvents(scheduleRes.events || []);
      }

      if (liveRes.ok) {
        setLiveStatus({
          isLive: liveRes.isLive,
          liveEvent: liveRes.liveEvent
        });
      }
    } catch (err) {
      console.error('[BroadcastControlRoom] Load error:', err);
      setError(err.message || 'Failed to load broadcast data');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Form handlers
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    
    try {
      const res = await createBroadcastEvent(slug, formData);
      if (res.ok) {
        setEvents(prev => [...prev, res.event].sort((a, b) => 
          new Date(a.startsAt) - new Date(b.startsAt)
        ));
        setShowForm(false);
        setFormData({
          title: '',
          description: '',
          type: 'vod',
          videoUrl: '',
          thumbnailUrl: '',
          startsAt: '',
          endsAt: '',
          isFeatured: false
        });
      }
    } catch (err) {
      console.error('[BroadcastControlRoom] Create error:', err);
      alert('Failed to create event: ' + err.message);
    }
  };

  const handleToggleFeatured = async (event) => {
    try {
      const res = await updateBroadcastEvent(event._id, { 
        isFeatured: !event.isFeatured 
      });
      if (res.ok) {
        setEvents(prev => prev.map(e => 
          e._id === event._id 
            ? { ...e, isFeatured: !e.isFeatured }
            : e._id !== event._id && res.event.isFeatured 
              ? { ...e, isFeatured: false }
              : e
        ));
      }
    } catch (err) {
      console.error('[BroadcastControlRoom] Toggle featured error:', err);
    }
  };

  const handleToggleLive = async (event) => {
    try {
      const isCurrentlyLive = event.isLiveOverride || event.status === 'live';
      const res = await setLiveOverride(slug, event._id, !isCurrentlyLive);
      
      if (res.ok) {
        setLiveStatus({
          isLive: res.isLive,
          liveEvent: res.liveEvent || null
        });
        await loadData(); // Refresh all data
      }
    } catch (err) {
      console.error('[BroadcastControlRoom] Toggle live error:', err);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!confirm(`Delete "${event.title}"?`)) return;
    
    try {
      const res = await deleteBroadcastEvent(event._id);
      if (res.ok) {
        setEvents(prev => prev.filter(e => e._id !== event._id));
      }
    } catch (err) {
      console.error('[BroadcastControlRoom] Delete error:', err);
      alert('Failed to delete event: ' + err.message);
    }
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.controlRoom}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner} />
          <p>Loading Broadcast Control Room...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={styles.controlRoom}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Control Room</h2>
          <p>{error}</p>
          <button onClick={loadData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.controlRoom}>
      {/* Header */}
      <header className={styles.controlRoomHeader}>
        <div className={styles.controlRoomTitle}>
          <h1>📡 Broadcast Control Room</h1>
          {station && (
            <span className={styles.controlRoomStation}>{station.name}</span>
          )}
        </div>

        {/* Live Status */}
        <div className={styles.controlRoomStatus}>
          {liveStatus.isLive ? (
            <div className={styles.liveBadgeLarge}>
              <span className={styles.liveDot} />
              LIVE: {liveStatus.liveEvent?.title}
            </div>
          ) : (
            <div className={styles.offlineBadgeLarge}>
              <span className={styles.offlineDot} />
              OFFLINE
            </div>
          )}
        </div>

        <button 
          type="button"
          className={styles.createEventButton}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '✕ Cancel' : '+ New Event'}
        </button>
      </header>

      {/* Next Event Countdown */}
      {nextEvent && countdown.totalMs > 0 && (
        <div className={styles.countdownBanner}>
          <span className={styles.countdownLabel}>Next Up: {nextEvent.title}</span>
          <span className={styles.countdownTime}>{countdown.formatted?.short || '--:--'}</span>
        </div>
      )}

      {/* Create Event Form */}
      {showForm && (
        <form className={styles.eventForm} onSubmit={handleCreateEvent}>
          <h3>Create Broadcast Event</h3>
          
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                placeholder="Event title"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Type *</label>
              <select name="type" value={formData.type} onChange={handleFormChange}>
                <option value="vod">VOD</option>
                <option value="premiere">Premiere</option>
                <option value="live">Live</option>
                <option value="replay">Replay</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Video URL *</label>
              <input
                type="url"
                name="videoUrl"
                value={formData.videoUrl}
                onChange={handleFormChange}
                required
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Thumbnail URL</label>
              <input
                type="url"
                name="thumbnailUrl"
                value={formData.thumbnailUrl}
                onChange={handleFormChange}
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Starts At *</label>
              <input
                type="datetime-local"
                name="startsAt"
                value={formData.startsAt}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label>Ends At</label>
              <input
                type="datetime-local"
                name="endsAt"
                value={formData.endsAt}
                onChange={handleFormChange}
              />
            </div>

            <div className={styles.formGroupFull}>
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleFormChange}
                placeholder="Event description..."
                rows={3}
              />
            </div>

            <div className={styles.formGroupCheckbox}>
              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleFormChange}
                />
                Featured Event
              </label>
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Create Event
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className={styles.eventsSection}>
        <h2>📅 Scheduled Events ({events.length})</h2>
        
        {events.length === 0 ? (
          <div className={styles.emptyEvents}>
            <p>No broadcast events scheduled.</p>
            <button onClick={() => setShowForm(true)}>
              + Create your first event
            </button>
          </div>
        ) : (
          <div className={styles.eventsList}>
            {events.map(event => (
              <div 
                key={event._id} 
                className={`${styles.eventCard} ${
                  event.isLiveOverride || event.status === 'live' 
                    ? styles.eventCardLive 
                    : ''
                }`}
              >
                <div className={styles.eventCardMain}>
                  <div className={styles.eventCardHeader}>
                    <span className={styles.eventTitle}>{event.title}</span>
                    <div className={styles.eventBadges}>
                      <span className={`${styles.eventTypeBadge} ${styles[`type${event.type}`]}`}>
                        {event.type}
                      </span>
                      {event.isFeatured && (
                        <span className={styles.featuredBadge}>⭐ Featured</span>
                      )}
                      {(event.isLiveOverride || event.status === 'live') && (
                        <span className={styles.liveBadgeSmall}>🔴 LIVE</span>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.eventCardMeta}>
                    <span>📅 {formatDate(event.startsAt)}</span>
                    {event.endsAt && (
                      <span> → {formatDate(event.endsAt)}</span>
                    )}
                    <span className={styles.eventStatus}>
                      Status: {event.status}
                    </span>
                  </div>
                </div>

                <div className={styles.eventCardActions}>
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(event)}
                    className={event.isFeatured ? styles.activeFeatured : ''}
                    title="Toggle Featured"
                  >
                    ⭐
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleLive(event)}
                    className={event.isLiveOverride ? styles.activeLive : ''}
                    title="Toggle Live"
                  >
                    🔴
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteEvent(event)}
                    className={styles.deleteButton}
                    title="Delete"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BroadcastControlRoom;



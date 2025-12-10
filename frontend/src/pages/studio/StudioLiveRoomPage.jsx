// frontend/src/pages/studio/StudioLiveRoomPage.jsx
// Live Room - Real-time collaborative recording sessions

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import studioApi from "../../lib/studioApi.js";
import "../../styles/studio-unified.css";

export default function StudioLiveRoomPage() {
  const navigate = useNavigate();
  const { roomId } = useParams();
  
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [roomCode, setRoomCode] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadRooms();
    if (roomId) {
      loadRoom(roomId);
    }
  }, [roomId]);

  const loadRooms = async () => {
    try {
      const res = await studioApi.getLiveRooms("active", 20);
      if (res?.ok) {
        setRooms(res.rooms || []);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadRoom = async (id) => {
    try {
      const res = await studioApi.getLiveRoom(id);
      if (res?.ok) {
        setActiveRoom(res.room);
      }
    } catch (err) {
      setError("Failed to load room");
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      setError("Please enter a room name");
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await studioApi.createLiveRoom({ name: newRoomName });
      if (res?.ok) {
        setActiveRoom(res.room);
        setShowCreateModal(false);
        setNewRoomName("");
        navigate(`/studio/live-room/${res.room.id}`);
      }
    } catch (err) {
      setError(err.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomCode.trim()) {
      setError("Please enter a room code");
      return;
    }

    setJoining(true);
    setError(null);

    try {
      const res = await studioApi.joinLiveRoom(roomCode.toUpperCase());
      if (res?.ok) {
        setActiveRoom(res.room);
        navigate(`/studio/live-room/${res.room.id}`);
      }
    } catch (err) {
      setError(err.message || "Invalid room code");
    } finally {
      setJoining(false);
    }
  };

  const handleSelectRoom = (room) => {
    navigate(`/studio/live-room/${room.id}`);
  };

  return (
    <div className="studio-page">
      <header className="studio-page-header">
        <button className="studio-back-btn" onClick={() => navigate("/studio")}>
          ← Back
        </button>
        <h1 className="studio-page-title">🔴 Live Room</h1>
        <p className="studio-page-subtitle">Real-time collaborative recording sessions</p>
      </header>

      {error && (
        <div className="studio-alert studio-alert--error">
          ⚠️ {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {!activeRoom ? (
        <>
          {/* Join / Create Room */}
          <div className="studio-grid studio-grid--2">
            <div className="studio-card">
              <h3 className="studio-card-title">🔗 Join Room</h3>
              <p className="card-desc">Enter a room code to join an existing session</p>
              <div className="join-form">
                <input
                  type="text"
                  placeholder="Enter room code..."
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="room-code-input"
                />
                <button
                  className="studio-btn studio-btn--primary"
                  onClick={handleJoinRoom}
                  disabled={joining || !roomCode.trim()}
                >
                  {joining ? "Joining..." : "Join"}
                </button>
              </div>
            </div>

            <div className="studio-card">
              <h3 className="studio-card-title">✨ Create Room</h3>
              <p className="card-desc">Start a new collaborative recording session</p>
              <button
                className="studio-btn studio-btn--secondary"
                style={{ width: "100%" }}
                onClick={() => setShowCreateModal(true)}
              >
                🎙️ Create New Room
              </button>
            </div>
          </div>

          {/* Active Rooms List */}
          <div className="studio-card" style={{ marginTop: 24 }}>
            <h3 className="studio-card-title">🌐 Active Rooms</h3>
            {loading ? (
              <div className="loading-state">Loading rooms...</div>
            ) : rooms.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎵</span>
                <span>No active rooms right now</span>
              </div>
            ) : (
              <div className="rooms-list">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="room-card"
                    onClick={() => handleSelectRoom(room)}
                  >
                    <div className="room-status">
                      <span className="live-dot" />
                      LIVE
                    </div>
                    <div className="room-info">
                      <span className="room-name">{room.name}</span>
                      <span className="room-meta">
                        {room.participants?.length || 0} participants • Host: {room.host?.name || "Unknown"}
                      </span>
                    </div>
                    <button className="studio-btn studio-btn--outline studio-btn--small">
                      Join
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        /* Active Room View */
        <div className="live-session">
          <div className="session-header">
            <div className="session-info">
              <span className="live-badge">🔴 LIVE</span>
              <h2 className="session-name">{activeRoom.name}</h2>
              <span className="session-code">Room Code: {activeRoom.roomCode}</span>
            </div>
            <button className="studio-btn studio-btn--outline" onClick={() => setActiveRoom(null)}>
              Leave Room
            </button>
          </div>

          <div className="studio-grid studio-grid--3">
            {/* Participants */}
            <div className="studio-card">
              <h3 className="studio-card-title">👥 Participants</h3>
              <div className="participants-list">
                {(activeRoom.participants || []).map((p, i) => (
                  <div key={i} className="participant">
                    <span className="participant-avatar">
                      {p.name?.charAt(0) || "?"}
                    </span>
                    <div className="participant-info">
                      <span className="participant-name">{p.name || "Guest"}</span>
                      <span className="participant-role">{p.role || "Participant"}</span>
                    </div>
                    {p.isMuted ? (
                      <span className="muted-icon">🔇</span>
                    ) : (
                      <span className="speaking-icon">🎙️</span>
                    )}
                  </div>
                ))}
              </div>
              <button className="studio-btn studio-btn--outline" style={{ marginTop: 12, width: "100%" }}>
                🔗 Invite Others
              </button>
            </div>

            {/* Recording Area */}
            <div className="studio-card recording-area">
              <h3 className="studio-card-title">🎙️ Recording</h3>
              <div className="recording-visual">
                <div className="waveform-placeholder">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="wave-bar"
                      style={{ height: `${Math.random() * 60 + 20}%` }}
                    />
                  ))}
                </div>
              </div>
              <div className="recording-controls">
                <button className="record-btn record-btn--stop">⏹️</button>
                <button className="record-btn record-btn--record">⏺️</button>
                <button className="record-btn record-btn--pause">⏸️</button>
              </div>
              <div className="recording-time">00:00:00</div>
            </div>

            {/* Tracks */}
            <div className="studio-card">
              <h3 className="studio-card-title">🎚️ Tracks</h3>
              <div className="tracks-list">
                <div className="track">
                  <span className="track-icon">🎤</span>
                  <span className="track-name">Vocal 1</span>
                  <div className="track-meter" />
                </div>
                <div className="track">
                  <span className="track-icon">🎹</span>
                  <span className="track-name">Beat</span>
                  <div className="track-meter" />
                </div>
              </div>
              <button className="studio-btn studio-btn--secondary" style={{ marginTop: 12, width: "100%" }}>
                ➕ Add Track
              </button>
            </div>
          </div>

          {/* Chat / Notes */}
          <div className="studio-card" style={{ marginTop: 24 }}>
            <h3 className="studio-card-title">💬 Session Chat</h3>
            <div className="chat-area">
              <div className="chat-messages">
                <div className="chat-message">
                  <span className="chat-author">System</span>
                  <span className="chat-text">Session started</span>
                </div>
              </div>
              <div className="chat-input">
                <input type="text" placeholder="Type a message..." />
                <button className="studio-btn studio-btn--primary">Send</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Live Room</h3>
            <input
              type="text"
              placeholder="Room name..."
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              className="room-name-input"
            />
            <div className="modal-actions">
              <button className="studio-btn studio-btn--outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className="studio-btn studio-btn--primary"
                onClick={handleCreateRoom}
                disabled={creating}
              >
                {creating ? "Creating..." : "Create Room"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .studio-page {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .studio-page-header {
          margin-bottom: 24px;
        }

        .studio-back-btn {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 0.9rem;
          margin-bottom: 8px;
        }

        .studio-page-title {
          font-size: 2rem;
          font-weight: 900;
          margin: 0;
          background: linear-gradient(90deg, #fff, #ff6b6b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .studio-page-subtitle {
          color: #888;
          margin: 4px 0 0;
        }

        .studio-grid--2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .studio-grid--3 {
          display: grid;
          grid-template-columns: 1fr 2fr 1fr;
          gap: 24px;
        }

        .studio-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 16px;
          padding: 24px;
        }

        .studio-card-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0 0 12px;
        }

        .card-desc {
          color: #888;
          font-size: 0.9rem;
          margin: 0 0 16px;
        }

        .join-form {
          display: flex;
          gap: 12px;
        }

        .room-code-input {
          flex: 1;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          font-size: 1.2rem;
          letter-spacing: 4px;
          text-transform: uppercase;
          text-align: center;
        }

        .rooms-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .room-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .room-card:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 107, 107, 0.3);
        }

        .room-status {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ff6b6b;
          font-size: 0.75rem;
          font-weight: 700;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          background: #ff6b6b;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .room-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .room-name {
          font-weight: 600;
          color: #fff;
        }

        .room-meta {
          font-size: 0.8rem;
          color: #666;
        }

        .live-session {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .session-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .live-badge {
          background: #ff6b6b;
          color: #fff;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          animation: pulse 1.5s infinite;
        }

        .session-name {
          margin: 0;
          font-size: 1.5rem;
        }

        .session-code {
          color: #888;
          font-family: monospace;
        }

        .participants-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .participant {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .participant-avatar {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #ff6b6b, #cc5050);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .participant-info {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .participant-name {
          font-weight: 600;
          font-size: 0.9rem;
        }

        .participant-role {
          font-size: 0.75rem;
          color: #888;
        }

        .recording-area {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .waveform-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 3px;
          height: 120px;
          padding: 20px;
        }

        .wave-bar {
          width: 4px;
          background: linear-gradient(135deg, #ff6b6b, #ff9999);
          border-radius: 2px;
          animation: wave 0.5s ease-in-out infinite alternate;
        }

        .wave-bar:nth-child(odd) {
          animation-delay: 0.1s;
        }

        @keyframes wave {
          from { transform: scaleY(0.5); }
          to { transform: scaleY(1); }
        }

        .recording-controls {
          display: flex;
          gap: 16px;
          margin-top: 16px;
        }

        .record-btn {
          width: 50px;
          height: 50px;
          border: none;
          border-radius: 50%;
          font-size: 20px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .record-btn--record {
          background: #ff4444;
        }

        .record-btn--stop {
          background: #333;
        }

        .record-btn--pause {
          background: #333;
        }

        .recording-time {
          margin-top: 12px;
          font-family: monospace;
          font-size: 1.5rem;
          color: #ff6b6b;
        }

        .tracks-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .track {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
        }

        .track-name {
          flex: 1;
          font-weight: 600;
        }

        .track-meter {
          width: 60px;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .track-meter::after {
          content: '';
          display: block;
          width: 40%;
          height: 100%;
          background: linear-gradient(90deg, #00c864, #ffb84d);
        }

        .chat-area {
          display: flex;
          flex-direction: column;
          height: 200px;
        }

        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 8px;
        }

        .chat-message {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }

        .chat-author {
          color: #ff6b6b;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .chat-text {
          color: #ccc;
          font-size: 0.85rem;
        }

        .chat-input {
          display: flex;
          gap: 8px;
          margin-top: 12px;
        }

        .chat-input input {
          flex: 1;
          padding: 10px 14px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: #1a1a1f;
          border-radius: 16px;
          padding: 32px;
          min-width: 400px;
        }

        .modal-content h3 {
          margin: 0 0 16px;
        }

        .room-name-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          color: #fff;
          margin-bottom: 16px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          color: #666;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .loading-state {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .studio-alert {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .studio-alert--error {
          background: rgba(255, 68, 68, 0.15);
          color: #ff6666;
        }

        .studio-alert button {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .studio-grid--2,
          .studio-grid--3 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}


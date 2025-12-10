// frontend/studio-app/src/pages/RecordBoot.jsx

import React, { useEffect, useRef, useState } from "react";
import "./RecordBoot.css";
import CompareTakes from "../components/CompareTakes.jsx";
import StudioProControls from "../components/StudioProControls.jsx";
import { STUDIO_API_BASE } from "../config/api.js";

// Use centralized API config
const API_BASE = STUDIO_API_BASE;

const RecordBoot = () => {
  const [hasMic, setHasMic] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentBlob, setCurrentBlob] = useState(null);
  const [currentUrl, setCurrentUrl] = useState("");
  const [takes, setTakes] = useState([]);
  const [statusMessage, setStatusMessage] = useState("");
  const [email, setEmail] = useState("");

  // AI Coach state
  const [artistName, setArtistName] = useState("");
  const [trackTitle, setTrackTitle] = useState("");
  const [coachMode, setCoachMode] = useState("standard");
  const [lyrics, setLyrics] = useState("");
  const [transcript, setTranscript] = useState("");

  const [coachLoading, setCoachLoading] = useState(false);
  const [coachError, setCoachError] = useState("");
  const [coachResult, setCoachResult] = useState(null);

  // If you already have upload result:
  const [lastAudioUrl, setLastAudioUrl] = useState("");

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  // Ask for microphone on first load
  useEffect(() => {
    const askMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
        setHasMic(true);
        setPermissionError("");
      } catch (err) {
        console.error("Mic permission error:", err);
        setPermissionError(
          "Microphone access denied. Enable mic permissions in your browser settings."
        );
        setHasMic(false);
      }
    };
    askMic();

    // Cleanup
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startRecording = () => {
    if (!hasMic || !mediaStreamRef.current) {
      setPermissionError("No microphone available.");
      return;
    }
    try {
      chunksRef.current = [];
      const recorder = new MediaRecorder(mediaStreamRef.current, {
        mimeType: "audio/webm;codecs=opus",
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl);
        }
        const url = URL.createObjectURL(blob);
        setCurrentBlob(blob);
        setCurrentUrl(url);
        setStatusMessage("Take recorded. You can listen or upload this take.");
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setStatusMessage("Recording... Perform your verse / hook now.");
    } catch (err) {
      console.error("Error starting recording:", err);
      setStatusMessage("Unable to start recording. Check console for details.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const discardCurrentTake = () => {
    if (currentUrl) {
      URL.revokeObjectURL(currentUrl);
    }
    setCurrentBlob(null);
    setCurrentUrl("");
    setStatusMessage("Current take discarded. You can record a new one.");
  };

  // AI Coach analysis function
  const runCoachAnalysis = async (audioUrlOverride) => {
    try {
      setCoachError("");
      setCoachResult(null);
      setCoachLoading(true);

      const res = await fetch(`${API_BASE}/api/aicoach/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artistName: artistName || "Unknown Artist",
          trackTitle: trackTitle || "Untitled Track",
          coachMode,
          lyrics,
          transcript,
          audioUrl: audioUrlOverride || lastAudioUrl || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "AI Coach failed.");
      }

      const data = await res.json();
      setCoachResult(data);
    } catch (err) {
      console.error(err);
      setCoachError(err.message || "Something went wrong with AI Coach.");
    } finally {
      setCoachLoading(false);
    }
  };

  const uploadCurrentTake = async () => {
    if (!currentBlob) {
      setStatusMessage("No take to upload. Record first.");
      return;
    }
    try {
      setIsUploading(true);
      setStatusMessage("Uploading take to the studio engine...");

      const formData = new FormData();
      const fileName = `record-boot-${Date.now()}.webm`;
      formData.append("file", currentBlob, fileName);
      if (email.trim()) {
        formData.append("email", email.trim());
      }

      const res = await fetch(`${API_BASE}/api/studio/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Upload failed.");
      }

      const data = await res.json().catch(() => ({}));

      // Store the audio URL from backend for AI Coach
      const urlFromBackend =
        data.audioUrl || data.fileUrl || data.secureUrl || "";
      setLastAudioUrl(urlFromBackend);

      const newTake = {
        id: data.id || Date.now().toString(),
        fileName,
        url: currentUrl,
        audioUrl: urlFromBackend,
        createdAt: new Date().toISOString(),
        status: "Uploaded",
      };
      setTakes((prev) => [newTake, ...prev]);
      setStatusMessage("Take uploaded successfully. Locked into the studio.");

      // Optionally trigger AI Coach automatically after upload:
      // await runCoachAnalysis(urlFromBackend);

      // Keep the audio around so they can still play current take
    } catch (err) {
      console.error("Upload error:", err);
      setStatusMessage(err.message || "Failed to upload take.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="record-boot-screen">
      {/* Top bar / title */}
      <div className="record-boot-header">
        <div className="record-boot-title-block">
          <h1 className="record-boot-title">Record Boot</h1>
          <p className="record-boot-subtitle">
            PowerHarmony Studio · Gold Room — This is where you cut the takes.
          </p>
        </div>
        <div className="record-boot-meta">
          <span className="record-boot-pill">Studio Online</span>
          <span className="record-boot-pill record-boot-pill--gold">
            Engine: Live
          </span>
        </div>
      </div>

      {/* Main layout: left = controls, right = takes list */}
      <div className="record-boot-layout">
        {/* LEFT: Record controls */}
        <div className="record-boot-card record-boot-card--controls">
          <h2 className="record-boot-section-title">Recording Deck</h2>
          <p className="record-boot-section-text">
            Hit record, drop your verse or hook, then stop when you&apos;re done.
            You can replay the take before you lock it into the studio.
          </p>

          {permissionError && (
            <div className="record-boot-warning">{permissionError}</div>
          )}

          <div className="record-boot-record-box">
            <div className="record-boot-status-row">
              <div
                className={
                  isRecording
                    ? "record-boot-led record-boot-led--on"
                    : "record-boot-led"
                }
              />
              <span className="record-boot-status-text">
                {isRecording ? "Recording..." : "Idle / Ready"}
              </span>
            </div>

            <div className="record-boot-controls-row">
              {!isRecording ? (
                <button
                  className="record-boot-btn record-boot-btn--primary"
                  onClick={startRecording}
                  disabled={!hasMic}
                >
                  🎙 Start Take
                </button>
              ) : (
                <button
                  className="record-boot-btn record-boot-btn--danger"
                  onClick={stopRecording}
                >
                  ⏹ Stop Take
                </button>
              )}
              <button
                className="record-boot-btn"
                onClick={discardCurrentTake}
                disabled={!currentBlob || isRecording}
              >
                🗑 Discard Take
              </button>
            </div>

            <div className="record-boot-audio-preview">
              <label className="record-boot-field-label">
                Current Take Preview
              </label>
              {currentUrl ? (
                <audio controls src={currentUrl} className="record-boot-audio" />
              ) : (
                <div className="record-boot-placeholder">
                  No take recorded yet. Hit <strong>Start Take</strong> to begin.
                </div>
              )}
            </div>

            <div className="record-boot-upload-row">
              <div className="record-boot-upload-left">
                <label className="record-boot-field-label">
                  Email this take (optional)
                </label>
                <input
                  type="email"
                  className="record-boot-input"
                  placeholder="artist@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <small className="record-boot-help">
                  The studio can send a download link to this address if enabled.
                </small>
              </div>
              <div className="record-boot-upload-actions">
                <button
                  className="record-boot-btn record-boot-btn--gold"
                  onClick={uploadCurrentTake}
                  disabled={!currentBlob || isRecording || isUploading}
                >
                  {isUploading ? "Uploading..." : "⬆ Upload Take"}
                </button>
              </div>
            </div>
          </div>

          {statusMessage && (
            <div className="record-boot-status-message">{statusMessage}</div>
          )}
        </div>

        {/* RIGHT: Takes list */}
        <div className="record-boot-card record-boot-card--takes">
          <h2 className="record-boot-section-title">Take History</h2>
          <p className="record-boot-section-text">
            Every time you upload, the studio logs that take here. You can
            replay what you&apos;ve locked in and keep track of your best
            performances.
          </p>

          {takes.length === 0 ? (
            <div className="record-boot-placeholder record-boot-placeholder--box">
              No takes uploaded yet. Once you upload a take, it will appear here.
            </div>
          ) : (
            <ul className="record-boot-take-list">
              {takes.map((take) => (
                <li key={take.id} className="record-boot-take-item">
                  <div className="record-boot-take-main">
                    <span className="record-boot-take-name">
                      {take.fileName}
                    </span>
                    <span className="record-boot-take-status">
                      {take.status}
                    </span>
                  </div>
                  <div className="record-boot-take-meta">
                    <span>
                      {new Date(take.createdAt).toLocaleString(undefined, {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </div>
                  {take.url && (
                    <audio
                      controls
                      src={take.url}
                      className="record-boot-audio-small"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* Compare Takes Component */}
          <CompareTakes
            artistName={artistName}
            trackTitle={trackTitle}
            onSelectTake={(take) => {
              // When user clicks a previous take, show its feedback
              if (take) {
                setCoachResult(take);
              }
            }}
          />
        </div>
      </div>

      {/* AI Coach Panel */}
      <div className="record-boot-coach-panel">
        <h2 className="record-boot-section-title">AI Coach / Producer Mode</h2>
        <p className="record-boot-section-text">
          After you record a take, let the AI Coach grade your performance and tell you what to fix.
        </p>

        <div className="record-boot-coach-row">
          <div className="record-boot-field">
            <label className="record-boot-field-label">Artist Name</label>
            <input
              type="text"
              className="record-boot-input"
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Your artist name"
            />
          </div>

          <div className="record-boot-field">
            <label className="record-boot-field-label">Track Title</label>
            <input
              type="text"
              className="record-boot-input"
              value={trackTitle}
              onChange={(e) => setTrackTitle(e.target.value)}
              placeholder="Song title"
            />
          </div>
        </div>

        <div className="record-boot-coach-row">
          <div className="record-boot-field">
            <label className="record-boot-field-label">Coach Mode</label>
            <select
              className="record-boot-select"
              value={coachMode}
              onChange={(e) => setCoachMode(e.target.value)}
            >
              <option value="standard">Standard Coach</option>
              <option value="dre">Precision Mode (Dre)</option>
              <option value="master_p">No Limit Hustle Mode</option>
              <option value="kanye">Creative Genius Mode</option>
              <option value="timbaland">Rhythm &amp; Flow Mode</option>
              <option value="motivational">Motivational Mode</option>
            </select>
          </div>
        </div>

        <div className="record-boot-field">
          <label className="record-boot-field-label">Lyrics (optional)</label>
          <textarea
            className="record-boot-textarea"
            rows={3}
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            placeholder="Paste the lyrics or key lines you just recorded..."
          />
        </div>

        <div className="record-boot-field">
          <label className="record-boot-field-label">Transcript (optional)</label>
          <textarea
            className="record-boot-textarea"
            rows={3}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="If you have a rough transcript of what you performed, paste it here."
          />
        </div>

        {coachError && (
          <div className="record-boot-warning">{coachError}</div>
        )}

        <button
          className="record-boot-btn record-boot-btn--gold"
          type="button"
          disabled={coachLoading}
          onClick={() => runCoachAnalysis()}
        >
          {coachLoading ? "Analyzing..." : "🎤 Analyze This Take"}
        </button>

        {coachResult && (
          <div className="record-boot-coach-result">
            <h3 className="record-boot-coach-result-title">Coach Feedback</h3>
            <p className="record-boot-coach-feedback">{coachResult.feedback}</p>

            {coachResult.suggestions && coachResult.suggestions.length > 0 && (
              <div className="record-boot-coach-suggestions">
                <h4>Suggestions:</h4>
                <ul>
                  {coachResult.suggestions.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

            {coachResult.scores && (
              <div className="record-boot-coach-scores">
                <h4>Performance Scores:</h4>
                <div className="record-boot-scores-grid">
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Delivery</span>
                    <span className="record-boot-score-value">{coachResult.scores.delivery}</span>
                  </div>
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Clarity</span>
                    <span className="record-boot-score-value">{coachResult.scores.clarity}</span>
                  </div>
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Emotion</span>
                    <span className="record-boot-score-value">{coachResult.scores.emotion}</span>
                  </div>
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Energy</span>
                    <span className="record-boot-score-value">{coachResult.scores.energy}</span>
                  </div>
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Pitch</span>
                    <span className="record-boot-score-value">{coachResult.scores.pitch}</span>
                  </div>
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Flow</span>
                    <span className="record-boot-score-value">{coachResult.scores.flow}</span>
                  </div>
                  <div className="record-boot-score-item">
                    <span className="record-boot-score-label">Confidence</span>
                    <span className="record-boot-score-value">{coachResult.scores.confidence}</span>
                  </div>
                  <div className="record-boot-score-item record-boot-score-item--overall">
                    <span className="record-boot-score-label">Overall</span>
                    <span className="record-boot-score-value">{coachResult.scores.overall}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Studio Pro Controls - Advanced AI Tools */}
      <StudioProControls
        sessionId={coachResult?._id || null}
        lastTranscript={transcript}
        lastScores={coachResult?.scores || {}}
      />
    </div>
  );
};

export default RecordBoot;


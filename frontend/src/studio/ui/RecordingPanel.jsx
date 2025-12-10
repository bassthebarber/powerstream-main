// frontend/src/studio/ui/RecordingPanel.jsx

import React, { useState, useEffect } from "react";
import { waveformEngine } from "../engine/WaveformEngine";
import { handleRecordButton, handleStopRecord, handlePlay, handleStop } from "./RecordControls";
import "./RecordingPanel.css";

export default function RecordingPanel({ trackId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    // Set up callbacks
    waveformEngine.onPlayCallback = () => setIsPlaying(true);
    waveformEngine.onStopCallback = () => setIsPlaying(false);
    waveformEngine.onUpdateCallback = (time) => setCurrentTime(time);

    return () => {
      waveformEngine.onPlayCallback = null;
      waveformEngine.onStopCallback = null;
      waveformEngine.onUpdateCallback = null;
    };
  }, []);

  const onRecord = () => {
    setIsRecording(true);
    handleRecordButton(trackId);
  };

  const onStopRecording = () => {
    setIsRecording(false);
    handleStopRecord();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-panel">
      <div className="transport-display">
        <span className="time-display">{formatTime(currentTime)}</span>
        {isRecording && <span className="recording-indicator">● REC</span>}
        {isPlaying && <span className="playing-indicator">▶ PLAY</span>}
      </div>

      <div className="recording-controls">
        <button 
          className={`control-btn record-btn ${isRecording ? 'active' : ''}`}
          onClick={isRecording ? onStopRecording : onRecord}
          disabled={isPlaying}
        >
          {isRecording ? '■ Stop Rec' : '● Record'}
        </button>

        <button 
          className="control-btn stop-btn"
          onClick={handleStop}
          disabled={!isPlaying}
        >
          ■ Stop
        </button>

        <button 
          className={`control-btn play-btn ${isPlaying ? 'active' : ''}`}
          onClick={handlePlay}
          disabled={isRecording || isPlaying}
        >
          ▶ Play
        </button>
      </div>
    </div>
  );
}



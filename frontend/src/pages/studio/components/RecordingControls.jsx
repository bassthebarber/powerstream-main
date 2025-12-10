import React from "react";

export default function RecordingControls({
  isRecording,
  hasTake,
  onStart,
  onStop,
  onPlay,
  onDelete,
  onSave
}) {
  return (
    <div className="record-controls">
      
      {/* START RECORDING */}
      {!isRecording && (
        <button className="record-btn start" onClick={onStart}>
          ● Start Recording
        </button>
      )}

      {/* STOP RECORDING */}
      {isRecording && (
        <button className="record-btn stop" onClick={onStop}>
          ■ Stop Recording
        </button>
      )}

      {/* PLAYBACK + DELETE + SAVE */}
      {hasTake && !isRecording && (
        <div className="take-actions">
          <button className="record-btn play" onClick={onPlay}>▶ Play</button>
          <button className="record-btn delete" onClick={onDelete}>✖ Delete</button>
          <button className="record-btn save" onClick={onSave}>⬆ Save Take</button>
        </div>
      )}
    </div>
  );
}



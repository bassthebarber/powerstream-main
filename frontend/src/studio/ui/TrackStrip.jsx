// frontend/src/studio/ui/TrackStrip.jsx

import React from "react";

export default function TrackStrip({
  track,
  onVolumeChange,
  onPanChange,
  onMuteChange,
  onSoloChange,
}) {
  const { id, name, volume, pan, mute, solo, meterValue } = track;

  const meterHeight = Math.min(100, Math.max(0, meterValue * 120)); // 0–100%

  return (
    <div className="track-strip">
      <div className="track-name">{name}</div>

      <div className="meter">
        <div
          className="meter-fill"
          style={{ height: `${meterHeight}%` }}
        />
      </div>

      <label className="fader">
        Vol
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => onVolumeChange(id, parseFloat(e.target.value))}
        />
      </label>

      <label className="pan">
        Pan
        <input
          type="range"
          min="-1"
          max="1"
          step="0.01"
          value={pan}
          onChange={(e) => onPanChange(id, parseFloat(e.target.value))}
        />
      </label>

      <div className="buttons">
        <button
          className={mute ? "btn mute active" : "btn mute"}
          onClick={() => onMuteChange(id, !mute)}
        >
          M
        </button>
        <button
          className={solo ? "btn solo active" : "btn solo"}
          onClick={() => onSoloChange(id, !solo)}
        >
          S
        </button>
      </div>
    </div>
  );
}



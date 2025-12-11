// frontend/src/studio/ui/MixerPanel.jsx

import React, { useEffect, useState } from "react";
import { waveformEngine } from "../engine/WaveformEngine";
import TrackStrip from "./TrackStrip";

export default function MixerPanel() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Initial snapshot
    setTracks(waveformEngine.getTracksSnapshot());

    // Subscribe to updates
    waveformEngine.subscribeOnUpdate((payload) => {
      if (payload && payload.tracks) {
        setTracks(payload.tracks);
      }
    });

    return () => {
      // Cleanup subscription
      waveformEngine.subscribeOnUpdate(null);
    };
  }, []);

  const handleVolumeChange = (trackId, volume) => {
    waveformEngine.setTrackVolume(trackId, volume);
  };

  const handlePanChange = (trackId, pan) => {
    waveformEngine.setTrackPan(trackId, pan);
  };

  const handleMuteChange = (trackId, value) => {
    waveformEngine.setTrackMute(trackId, value);
  };

  const handleSoloChange = (trackId, value) => {
    waveformEngine.setTrackSolo(trackId, value);
  };

  return (
    <div className="mixer-panel">
      {tracks.length === 0 ? (
        <div className="mixer-empty">No tracks. Add a track to begin.</div>
      ) : (
        tracks.map((t) => (
          <TrackStrip
            key={t.id}
            track={t}
            onVolumeChange={handleVolumeChange}
            onPanChange={handlePanChange}
            onMuteChange={handleMuteChange}
            onSoloChange={handleSoloChange}
          />
        ))
      )}
    </div>
  );
}



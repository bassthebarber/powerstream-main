// frontend/src/studio/ui/BeatGeneratorPanel.jsx
// AI Beat Generator UI Panel

import React, { useState, useEffect } from "react";
import { BeatService } from "../services/BeatService";
import { waveformEngine } from "../engine/WaveformEngine";
import "./BeatGeneratorPanel.css";

export default function BeatGeneratorPanel() {
  // Generation options
  const [tempo, setTempo] = useState(120);
  const [musicalKey, setMusicalKey] = useState("C");
  const [mood, setMood] = useState("dark");
  const [genre, setGenre] = useState("trap");
  const [structure, setStructure] = useState("verse-hook-verse");

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState("");
  const [presets, setPresets] = useState(null);

  // Load presets on mount
  useEffect(() => {
    BeatService.getPresets().then(setPresets).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    try {
      setError(null);
      setIsGenerating(true);
      setProgress("Generating beat patterns...");

      // Call backend to generate beat
      const result = await BeatService.generateBeat({
        tempo,
        key: musicalKey,
        mood,
        genre,
        structure,
      });

      if (!result.success) {
        throw new Error(result.error || "Failed to generate beat");
      }

      const { stems } = result;
      setProgress("Loading stems into mixer...");
      setIsLoading(true);

      // Resume audio context if needed
      if (waveformEngine.audioContext.state === "suspended") {
        await waveformEngine.audioContext.resume();
      }

      // Load each stem into a track
      const stemEntries = Object.entries(stems);
      let loadedCount = 0;

      for (const [stemName, url] of stemEntries) {
        setProgress(`Loading ${stemName}... (${loadedCount + 1}/${stemEntries.length})`);

        try {
          // Create track for this stem
          const trackId = waveformEngine.createTrack({
            name: stemName.charAt(0).toUpperCase() + stemName.slice(1),
            type: "instrument",
          });

          // Fetch and decode audio
          const audioData = await BeatService.fetchStemAudio(url);
          const audioBuffer = await waveformEngine.audioContext.decodeAudioData(audioData);

          // Add clip to track
          waveformEngine.addClipToTrack(trackId, {
            buffer: audioBuffer,
            startTime: 0,
            duration: audioBuffer.duration,
          });

          loadedCount++;
        } catch (stemError) {
          console.warn(`[BeatGenerator] Failed to load stem ${stemName}:`, stemError);
        }
      }

      setProgress(`✓ Loaded ${loadedCount} stems`);

      // Clear progress after a moment
      setTimeout(() => {
        setProgress("");
      }, 2000);

    } catch (err) {
      console.error("[BeatGenerator] Error:", err);
      setError(err.message || "Failed to generate beat");
    } finally {
      setIsGenerating(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="beat-generator-panel">
      <div className="beat-header">
        <span className="beat-icon">🎹</span>
        <h3>AI Beat Generator</h3>
      </div>

      <div className="beat-controls">
        {/* Tempo */}
        <label className="beat-control">
          <span>Tempo (BPM)</span>
          <div className="tempo-input">
            <input
              type="range"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              disabled={isGenerating}
            />
            <input
              type="number"
              min="60"
              max="180"
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value) || 120)}
              disabled={isGenerating}
            />
          </div>
        </label>

        {/* Key */}
        <label className="beat-control">
          <span>Key</span>
          <select
            value={musicalKey}
            onChange={(e) => setMusicalKey(e.target.value)}
            disabled={isGenerating}
          >
            {(presets?.keys || ["C", "D", "E", "F", "G", "A", "B"]).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>

        {/* Mood */}
        <label className="beat-control">
          <span>Mood</span>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            disabled={isGenerating}
          >
            {(presets?.moods || ["dark", "happy", "chill", "aggressive"]).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </label>

        {/* Genre */}
        <label className="beat-control">
          <span>Genre</span>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            disabled={isGenerating}
          >
            {(presets?.genres || ["trap", "hiphop", "rnb", "pop", "lofi"]).map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>

        {/* Structure */}
        <label className="beat-control">
          <span>Structure</span>
          <select
            value={structure}
            onChange={(e) => setStructure(e.target.value)}
            disabled={isGenerating}
          >
            {(presets?.structures || ["verse-hook-verse", "loop-4-bars", "loop-8-bars"]).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Generate Button */}
      <button
        className="generate-btn"
        onClick={handleGenerate}
        disabled={isGenerating || isLoading}
      >
        {isGenerating ? "⏳ Generating..." : isLoading ? "📥 Loading..." : "✨ Generate Beat"}
      </button>

      {/* Progress */}
      {progress && (
        <div className="beat-progress">{progress}</div>
      )}

      {/* Error */}
      {error && (
        <div className="beat-error">❌ {error}</div>
      )}

      {/* Info */}
      <div className="beat-info">
        <p>AI will generate drums, bass, chords, melody, and FX stems.</p>
        <p>Press Play after loading to hear your beat!</p>
      </div>
    </div>
  );
}



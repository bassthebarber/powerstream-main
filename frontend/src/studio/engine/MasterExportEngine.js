// frontend/src/studio/engine/MasterExportEngine.js
// PowerStream Studio - Master Export/Mixdown Engine

import { waveformEngine } from "./WaveformEngine";

class MasterExportEngine {
  constructor() {
    this.isExporting = false;
    this.progress = 0;
    this.onProgressCallback = null;
  }

  /**
   * Export the full mixdown as a WAV file
   * @returns {Promise<Blob>} WAV file blob
   */
  async exportMixdown() {
    if (this.isExporting) {
      throw new Error("Export already in progress");
    }

    this.isExporting = true;
    this.progress = 0;
    this._notifyProgress(0, "Preparing mixdown...");

    try {
      const sampleRate = 44100;
      const duration = waveformEngine._getTotalDuration();

      if (duration <= 0) {
        throw new Error("No audio to export. Add some clips first.");
      }

      this._notifyProgress(10, "Creating offline context...");

      // Create offline audio context for rendering
      const offline = new OfflineAudioContext(2, sampleRate * duration, sampleRate);

      // Master Bus
      const masterGain = offline.createGain();
      masterGain.gain.value = 1.0;
      masterGain.connect(offline.destination);

      this._notifyProgress(20, "Routing tracks...");

      // Check solo state
      const hasSolo = waveformEngine.tracks.some(t => t.solo);

      // Render each track
      let trackIndex = 0;
      for (const track of waveformEngine.tracks) {
        // Skip muted tracks or non-soloed tracks when solo is active
        const shouldMute = track.mute || (hasSolo && !track.solo);

        for (const clip of track.clips) {
          if (!clip.buffer) continue;

          const source = offline.createBufferSource();
          source.buffer = clip.buffer;

          // Track gain
          const gainNode = offline.createGain();
          gainNode.gain.value = shouldMute ? 0 : track.volume;

          // Pan
          const panNode = offline.createStereoPanner();
          panNode.pan.value = track.panNode ? track.panNode.pan.value : 0;

          // Route: source → pan → gain → master
          source.connect(panNode);
          panNode.connect(gainNode);
          gainNode.connect(masterGain);

          source.start(clip.startTime);
        }

        trackIndex++;
        const trackProgress = 20 + (trackIndex / waveformEngine.tracks.length) * 30;
        this._notifyProgress(trackProgress, `Processing track ${trackIndex}/${waveformEngine.tracks.length}...`);
      }

      this._notifyProgress(50, "Rendering audio...");

      // Render the audio
      const renderedBuffer = await offline.startRendering();

      this._notifyProgress(80, "Encoding WAV file...");

      // Convert to WAV
      const wavFile = this._bufferToWav(renderedBuffer);

      this._notifyProgress(100, "Export complete!");

      return wavFile;

    } finally {
      this.isExporting = false;
    }
  }

  /**
   * Export as MP3 (placeholder - requires additional library)
   * @returns {Promise<Blob>}
   */
  async exportMp3() {
    // Placeholder - would require lamejs or similar library
    console.warn("[MasterExport] MP3 export not yet implemented. Falling back to WAV.");
    return this.exportMixdown();
  }

  /**
   * Convert AudioBuffer to WAV Blob
   * @param {AudioBuffer} audioBuffer
   * @returns {Blob}
   */
  _bufferToWav(audioBuffer) {
    const numOfChan = audioBuffer.numberOfChannels;
    const length = audioBuffer.length * numOfChan * 2 + 44;
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);

    let pos = 0;

    // Helper functions
    const setUint16 = (data) => {
      view.setUint16(pos, data, true);
      pos += 2;
    };

    const setUint32 = (data) => {
      view.setUint32(pos, data, true);
      pos += 4;
    };

    // RIFF header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    // Format chunk
    setUint32(0x20746d66); // "fmt "
    setUint32(16); // chunk length
    setUint16(1); // PCM format
    setUint16(numOfChan); // number of channels
    setUint32(audioBuffer.sampleRate); // sample rate
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // byte rate
    setUint16(numOfChan * 2); // block align
    setUint16(16); // bits per sample

    // Data chunk
    setUint32(0x61746164); // "data"
    setUint32(length - pos - 4); // data length

    // Write interleaved audio samples
    const channels = [];
    for (let i = 0; i < numOfChan; i++) {
      channels.push(audioBuffer.getChannelData(i));
    }

    let offset = 0;
    while (pos < length) {
      for (let i = 0; i < numOfChan; i++) {
        let sample = Math.max(-1, Math.min(1, channels[i][offset] || 0));
        sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
        view.setInt16(pos, sample, true);
        pos += 2;
      }
      offset++;
    }

    return new Blob([buffer], { type: "audio/wav" });
  }

  /**
   * Subscribe to progress updates
   * @param {Function} callback - (progress: number, message: string) => void
   */
  onProgress(callback) {
    this.onProgressCallback = callback;
  }

  /**
   * Notify progress
   * @private
   */
  _notifyProgress(progress, message) {
    this.progress = progress;
    if (this.onProgressCallback) {
      this.onProgressCallback(progress, message);
    }
    console.log(`[MasterExport] ${progress}% - ${message}`);
  }

  /**
   * Download a blob as a file
   * @param {Blob} blob
   * @param {string} filename
   */
  downloadBlob(blob, filename = "mixdown.wav") {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

export const masterExportEngine = new MasterExportEngine();
export default masterExportEngine;



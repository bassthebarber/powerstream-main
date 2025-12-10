// frontend/src/studio/engine/WaveformEngine.js

class WaveformEngine {

  constructor() {
    this.audioContext = null;
    this.tracks = [];
    this.isPlaying = false;
    this.currentTime = 0;
    this.startTimestamp = 0;

    // Master Bus
    this.masterGain = null;

    // UI Callbacks
    this.onPlayCallback = null;
    this.onStopCallback = null;
    this.onUpdateCallback = null;

    // --- Recording State ---
    this.isRecording = false;
    this.recordingTrackId = null;
    this.mediaStream = null;
    this.mediaSource = null;
    this.processor = null;
    this.recordedChunks = [];

    this._init();
  }

  _init() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
  }

  // ------------------------------------------------
  // TRACK MANAGEMENT
  // ------------------------------------------------

  createTrack(options = {}) {
    const index = this.tracks.length + 1;
    const trackId = Date.now().toString() + "_" + index;
    const name = options.name || `Track ${index}`;
    const type = options.type || "audio";

    const gainNode = this.audioContext.createGain();
    const panNode = this.audioContext.createStereoPanner();
    const analyserNode = this.audioContext.createAnalyser();
    analyserNode.fftSize = 2048;

    // Route: source → analyser → pan → gain → master
    analyserNode.connect(panNode);
    panNode.connect(gainNode);
    gainNode.connect(this.masterGain);

    const track = {
      id: trackId,
      name,
      type,
      clips: [],
      analyserNode,
      panNode,
      gainNode,
      mute: false,
      solo: false,
      volume: 1.0,
      meterValue: 0,
    };

    this.tracks.push(track);
    this._updateSoloMuteRouting();
    return trackId;
  }

  addClipToTrack(trackId, clip) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.clips.push(clip);
  }

  setTrackVolume(trackId, volume) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.volume = volume;
    this._updateSoloMuteRouting();
  }

  setTrackPan(trackId, panValue) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) track.panNode.pan.value = panValue;
  }

  setTrackMute(trackId, value) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.mute = value;
    this._updateSoloMuteRouting();
  }

  setTrackSolo(trackId, value) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) return;
    track.solo = value;
    this._updateSoloMuteRouting();
  }

  // Legacy toggle methods (for backward compatibility)
  toggleMute(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) this.setTrackMute(trackId, !track.mute);
  }

  toggleSolo(trackId) {
    const track = this.tracks.find(t => t.id === trackId);
    if (track) this.setTrackSolo(trackId, !track.solo);
  }

  _updateSoloMuteRouting() {
    const hasSolo = this.tracks.some(t => t.solo);

    for (const track of this.tracks) {
      if (hasSolo) {
        // Solo mode: only soloed + non-muted tracks play
        if (track.solo && !track.mute) {
          track.gainNode.gain.value = track.volume;
        } else {
          track.gainNode.gain.value = 0;
        }
      } else {
        // Normal mode: mute = 0, otherwise volume
        if (track.mute) {
          track.gainNode.gain.value = 0;
        } else {
          track.gainNode.gain.value = track.volume;
        }
      }
    }
  }

  getTracksSnapshot() {
    return this.tracks.map(t => ({
      id: t.id,
      name: t.name,
      type: t.type,
      volume: t.volume,
      pan: t.panNode.pan.value,
      mute: t.mute,
      solo: t.solo,
      meterValue: t.meterValue,
    }));
  }

  subscribeOnUpdate(callback) {
    this.onUpdateCallback = callback;
  }

  // ------------------------------------------------
  // TRANSPORT CONTROLS
  // ------------------------------------------------

  play(startAt = 0) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.startTimestamp = this.audioContext.currentTime - startAt;
    this.currentTime = startAt;

    this._schedulePlayback();

    if (this.onPlayCallback) this.onPlayCallback();
    this._startUpdateLoop();
  }

  _schedulePlayback() {
    for (const track of this.tracks) {
      if (track.mute) continue;

      for (const clip of track.clips) {
        const source = this.audioContext.createBufferSource();
        source.buffer = clip.buffer;
        // Connect to analyserNode (which routes to pan → gain → master)
        source.connect(track.analyserNode);

        const when = clip.startTime + this.startTimestamp;
        source.start(when);
      }
    }
  }

  _startUpdateLoop() {
    const update = () => {
      if (!this.isPlaying) return;

      this.currentTime = this.audioContext.currentTime - this.startTimestamp;

      // Update meters
      this._updateMeters();

      // Fire callback with full payload
      if (this.onUpdateCallback) {
        this.onUpdateCallback({
          currentTime: this.currentTime,
          tracks: this.getTracksSnapshot(),
        });
      }

      requestAnimationFrame(update);
    };
    update();
  }

  _updateMeters() {
    for (const track of this.tracks) {
      if (!track.analyserNode) continue;

      const analyser = track.analyserNode;
      const data = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        const v = (data[i] - 128) / 128;
        sum += v * v;
      }

      const rms = Math.sqrt(sum / data.length);
      track.meterValue = rms; // 0–1
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.onStopCallback) this.onStopCallback();
  }

  reset() {
    this.stop();
    this.currentTime = 0;
  }

  seek(position) {
    this.stop();
    this.play(position);
  }

  // ------------------------------------------------
  // EXPORT HELPERS
  // ------------------------------------------------

  /**
   * Get the total duration of all tracks/clips
   * @returns {number} Duration in seconds
   */
  _getTotalDuration() {
    let max = 0;
    for (const t of this.tracks) {
      for (const clip of t.clips) {
        max = Math.max(max, clip.startTime + clip.duration);
      }
    }
    return max + 1; // Add 1 second buffer
  }

  /**
   * Get total duration (public method)
   * @returns {number}
   */
  getTotalDuration() {
    return this._getTotalDuration();
  }

  // ------------------------------------------------
  // RECORDING
  // ------------------------------------------------

  async startRecording(trackId) {
    if (this.isRecording) return;

    // Resume audio context if suspended (browser policy)
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }

    this.isRecording = true;
    this.recordingTrackId = trackId;
    this.recordedChunks = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaStream = stream;

    this.mediaSource = this.audioContext.createMediaStreamSource(stream);
    this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

    // Find the track and connect to its analyser for metering during recording
    const track = this.tracks.find(t => t.id === trackId);

    this.processor.onaudioprocess = (event) => {
      if (!this.isRecording) return;
      const input = event.inputBuffer.getChannelData(0);
      this.recordedChunks.push(new Float32Array(input));
    };

    this.mediaSource.connect(this.processor);
    this.processor.connect(this.audioContext.destination);

    // Also connect to analyser for live metering
    if (track && track.analyserNode) {
      this.mediaSource.connect(track.analyserNode);
    }

    // Start meter update loop during recording
    this._startRecordingMeterLoop();

    console.log("[WaveformEngine] Recording started on track:", trackId);
  }

  _startRecordingMeterLoop() {
    const update = () => {
      if (!this.isRecording) return;

      this._updateMeters();

      if (this.onUpdateCallback) {
        this.onUpdateCallback({
          currentTime: this.currentTime,
          tracks: this.getTracksSnapshot(),
          isRecording: true,
        });
      }

      requestAnimationFrame(update);
    };
    update();
  }

  async stopRecording() {
    if (!this.isRecording) return;

    this.isRecording = false;

    // Stop media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(t => t.stop());
    }

    // Disconnect processor
    if (this.processor) {
      this.processor.disconnect();
    }

    // Disconnect media source
    if (this.mediaSource) {
      this.mediaSource.disconnect();
    }

    // Merge chunks and convert to AudioBuffer
    const combined = this._mergeChunks(this.recordedChunks);
    const audioBuffer = await this._convertToAudioBuffer(combined);

    // Save to track
    this._saveRecordingToTrack(this.recordingTrackId, audioBuffer);

    console.log("[WaveformEngine] Recording stopped. Duration:", audioBuffer.duration.toFixed(2), "s");

    // Cleanup
    this.recordingTrackId = null;
    this.mediaStream = null;
    this.mediaSource = null;
    this.processor = null;
    this.recordedChunks = [];
  }

  _mergeChunks(chunks) {
    let totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
    let merged = new Float32Array(totalLength);
    let offset = 0;

    for (let chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.length;
    }

    return merged;
  }

  async _convertToAudioBuffer(float32Audio) {
    const audioBuffer = this.audioContext.createBuffer(
      1,
      float32Audio.length,
      this.audioContext.sampleRate
    );
    audioBuffer.copyToChannel(float32Audio, 0);
    return audioBuffer;
  }

  _saveRecordingToTrack(trackId, audioBuffer) {
    const track = this.tracks.find(t => t.id === trackId);
    if (!track) {
      console.warn("[WaveformEngine] Track not found:", trackId);
      return;
    }

    const clip = {
      buffer: audioBuffer,
      startTime: 0,
      duration: audioBuffer.duration,
    };

    track.clips.push(clip);
    console.log("[WaveformEngine] Clip saved to track:", trackId);
  }

}

// Export single instance
export const waveformEngine = new WaveformEngine();

// frontend/studio-app/src/hooks/useAudioMonitor.js
// Real-time audio monitoring with WebAudio API for Recording Booth
// Allows artist to "hear themselves" while recording with beat playback

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Audio monitoring hook for recording booth
 * Provides real-time mic monitoring with optional beat playback
 */
export function useAudioMonitor() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [latency, setLatency] = useState(0);
  const [error, setError] = useState(null);

  // WebAudio refs
  const audioContextRef = useRef(null);
  const micStreamRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const gainNodeRef = useRef(null);
  const compressorNodeRef = useRef(null);
  const analyserNodeRef = useRef(null);
  const beatAudioRef = useRef(null);
  const beatSourceRef = useRef(null);
  const beatGainRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Settings
  const [monitorVolume, setMonitorVolume] = useState(0.8);
  const [beatVolume, setBeatVolume] = useState(0.7);
  const [compressorEnabled, setCompressorEnabled] = useState(true);

  /**
   * Initialize AudioContext (must be called on user gesture)
   */
  const initAudioContext = useCallback(async () => {
    if (audioContextRef.current) return audioContextRef.current;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext({
        latencyHint: "interactive", // Low latency for monitoring
        sampleRate: 48000,
      });

      // Resume if suspended (browser autoplay policy)
      if (ctx.state === "suspended") {
        await ctx.resume();
      }

      audioContextRef.current = ctx;
      setLatency(ctx.baseLatency * 1000); // Convert to ms

      console.log("🎛️ AudioContext initialized:", {
        sampleRate: ctx.sampleRate,
        baseLatency: ctx.baseLatency,
        state: ctx.state,
      });

      return ctx;
    } catch (err) {
      console.error("AudioContext init failed:", err);
      setError("Failed to initialize audio system");
      return null;
    }
  }, []);

  /**
   * Request microphone access with optimized settings
   */
  const requestMicAccess = useCallback(async () => {
    try {
      setError(null);

      // Request mic with low-latency settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Disable for monitoring (prevents feedback loop)
          noiseSuppression: false, // Disable for natural sound
          autoGainControl: false, // Disable for consistent levels
          latency: 0, // Request lowest latency
          channelCount: 1, // Mono for voice
          sampleRate: 48000,
        },
      });

      micStreamRef.current = stream;
      setHasMic(true);
      console.log("🎤 Microphone access granted");
      return true;
    } catch (err) {
      console.error("Mic access error:", err);
      setError("Microphone access denied. Please enable mic permissions.");
      setHasMic(false);
      return false;
    }
  }, []);

  /**
   * Start audio monitoring (hear yourself)
   */
  const startMonitoring = useCallback(async () => {
    if (isMonitoring) return true;

    try {
      setError(null);

      // Initialize AudioContext
      const ctx = await initAudioContext();
      if (!ctx) return false;

      // Get mic access if not already
      if (!micStreamRef.current) {
        const hasAccess = await requestMicAccess();
        if (!hasAccess) return false;
      }

      // Create audio nodes
      // 1. Source from mic stream
      sourceNodeRef.current = ctx.createMediaStreamSource(micStreamRef.current);

      // 2. Gain node for volume control
      gainNodeRef.current = ctx.createGain();
      gainNodeRef.current.gain.value = isMuted ? 0 : monitorVolume;

      // 3. Compressor for dynamics control (prevents clipping)
      compressorNodeRef.current = ctx.createDynamicsCompressor();
      compressorNodeRef.current.threshold.value = -24;
      compressorNodeRef.current.knee.value = 30;
      compressorNodeRef.current.ratio.value = 12;
      compressorNodeRef.current.attack.value = 0.003;
      compressorNodeRef.current.release.value = 0.25;

      // 4. Analyser for level metering
      analyserNodeRef.current = ctx.createAnalyser();
      analyserNodeRef.current.fftSize = 256;
      analyserNodeRef.current.smoothingTimeConstant = 0.5;

      // Connect the chain: Mic → Gain → Compressor → Analyser → Output
      sourceNodeRef.current.connect(gainNodeRef.current);

      if (compressorEnabled) {
        gainNodeRef.current.connect(compressorNodeRef.current);
        compressorNodeRef.current.connect(analyserNodeRef.current);
      } else {
        gainNodeRef.current.connect(analyserNodeRef.current);
      }

      // Connect to destination (speakers/headphones) for monitoring
      analyserNodeRef.current.connect(ctx.destination);

      setIsMonitoring(true);

      // Start level metering
      startLevelMeter();

      console.log("🎧 Monitoring started - You can now hear yourself");
      return true;
    } catch (err) {
      console.error("Start monitoring error:", err);
      setError("Failed to start audio monitoring");
      return false;
    }
  }, [isMonitoring, isMuted, monitorVolume, compressorEnabled, initAudioContext, requestMicAccess]);

  /**
   * Stop audio monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (!isMonitoring) return;

    // Disconnect all nodes
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (compressorNodeRef.current) {
      compressorNodeRef.current.disconnect();
      compressorNodeRef.current = null;
    }
    if (analyserNodeRef.current) {
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }

    // Stop level meter
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsMonitoring(false);
    setMicLevel(0);
    console.log("🔇 Monitoring stopped");
  }, [isMonitoring]);

  /**
   * Toggle monitoring mute (keeps connection, just silences output)
   */
  const toggleMute = useCallback(() => {
    if (!gainNodeRef.current) return;

    const newMuted = !isMuted;
    gainNodeRef.current.gain.value = newMuted ? 0 : monitorVolume;
    setIsMuted(newMuted);
  }, [isMuted, monitorVolume]);

  /**
   * Set monitor volume (0.0 - 1.0)
   */
  const setVolume = useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMonitorVolume(clampedVolume);

    if (gainNodeRef.current && !isMuted) {
      gainNodeRef.current.gain.value = clampedVolume;
    }
  }, [isMuted]);

  /**
   * Load and play beat for monitoring
   */
  const loadBeat = useCallback(async (beatUrl) => {
    if (!beatUrl) return false;

    try {
      const ctx = await initAudioContext();
      if (!ctx) return false;

      // Stop any existing beat
      if (beatSourceRef.current) {
        beatSourceRef.current.stop();
        beatSourceRef.current.disconnect();
      }

      // Create audio element for beat
      const audio = new Audio();
      audio.crossOrigin = "anonymous";
      audio.src = beatUrl;
      audio.loop = true;
      beatAudioRef.current = audio;

      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audio.oncanplaythrough = resolve;
        audio.onerror = reject;
        audio.load();
      });

      // Create nodes for beat playback
      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gain.gain.value = beatVolume;

      source.connect(gain);
      gain.connect(ctx.destination);

      beatSourceRef.current = source;
      beatGainRef.current = gain;

      console.log("🎵 Beat loaded:", beatUrl);
      return true;
    } catch (err) {
      console.error("Beat load error:", err);
      setError("Failed to load beat audio");
      return false;
    }
  }, [beatVolume, initAudioContext]);

  /**
   * Play loaded beat
   */
  const playBeat = useCallback(() => {
    if (beatAudioRef.current) {
      beatAudioRef.current.play().catch((err) => {
        console.error("Beat play error:", err);
      });
    }
  }, []);

  /**
   * Pause beat
   */
  const pauseBeat = useCallback(() => {
    if (beatAudioRef.current) {
      beatAudioRef.current.pause();
    }
  }, []);

  /**
   * Stop beat
   */
  const stopBeat = useCallback(() => {
    if (beatAudioRef.current) {
      beatAudioRef.current.pause();
      beatAudioRef.current.currentTime = 0;
    }
  }, []);

  /**
   * Set beat volume
   */
  const setBeatVol = useCallback((volume) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setBeatVolume(clampedVolume);

    if (beatGainRef.current) {
      beatGainRef.current.gain.value = clampedVolume;
    }
  }, []);

  /**
   * Start level metering animation
   */
  const startLevelMeter = useCallback(() => {
    if (!analyserNodeRef.current) return;

    const analyser = analyserNodeRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateLevel = () => {
      if (!analyserNodeRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i] * dataArray[i];
      }
      const rms = Math.sqrt(sum / dataArray.length);

      // Normalize to 0-1 range
      const level = Math.min(1, rms / 128);
      setMicLevel(level);

      animationFrameRef.current = requestAnimationFrame(updateLevel);
    };

    updateLevel();
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      stopMonitoring();

      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      if (beatAudioRef.current) {
        beatAudioRef.current.pause();
        beatAudioRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [stopMonitoring]);

  return {
    // State
    isMonitoring,
    isMuted,
    hasMic,
    micLevel,
    latency,
    error,
    monitorVolume,
    beatVolume,
    compressorEnabled,

    // Monitoring controls
    startMonitoring,
    stopMonitoring,
    toggleMute,
    setVolume,

    // Beat controls
    loadBeat,
    playBeat,
    pauseBeat,
    stopBeat,
    setBeatVolume: setBeatVol,

    // Settings
    setCompressorEnabled,

    // Utilities
    requestMicAccess,
    initAudioContext,
  };
}

export default useAudioMonitor;




// frontend/studio-app/src/hooks/useAudioRecorder.js
// Custom hook for audio recording with low-latency monitoring support

import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(0);
  const [micLevel, setMicLevel] = useState(0);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  
  // WebAudio for monitoring and level metering
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const gainRef = useRef(null);
  const levelAnimRef = useRef(null);

  // Request microphone access with optimized settings for recording
  const requestMicAccess = useCallback(async () => {
    try {
      // Request mic with low-latency, high-quality settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Disable for studio recording
          noiseSuppression: false, // Disable for natural sound
          autoGainControl: false, // Disable for consistent levels
          latency: 0, // Request lowest latency
          channelCount: 1, // Mono for voice
          sampleRate: 48000, // High quality
        },
      });
      mediaStreamRef.current = stream;
      setHasMic(true);
      setPermissionError("");
      
      // Initialize level metering
      initLevelMeter(stream);
      
      return true;
    } catch (err) {
      console.error("Mic permission error:", err);
      setPermissionError("Microphone access denied. Enable mic permissions in your browser.");
      setHasMic(false);
      return false;
    }
  }, []);
  
  // Initialize level meter for real-time monitoring
  const initLevelMeter = useCallback((stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext({ latencyHint: "interactive" });
      audioContextRef.current = ctx;
      
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      
      source.connect(analyser);
      // Note: Not connecting to destination here - use useAudioMonitor for that
      
      sourceRef.current = source;
      analyserRef.current = analyser;
      
      // Start level animation
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateLevel = () => {
        if (!analyserRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sum / dataArray.length);
        const level = Math.min(1, rms / 128);
        setMicLevel(level);
        
        levelAnimRef.current = requestAnimationFrame(updateLevel);
      };
      
      updateLevel();
    } catch (err) {
      console.warn("Level meter init failed:", err);
    }
  }, []);

  // Initialize mic on mount
  useEffect(() => {
    requestMicAccess();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (levelAnimRef.current) {
        cancelAnimationFrame(levelAnimRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Start recording
  const startRecording = useCallback(() => {
    if (!hasMic || !mediaStreamRef.current) {
      setPermissionError("No microphone available.");
      return false;
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
        if (audioUrl) {
          URL.revokeObjectURL(audioUrl);
        }
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      startTimeRef.current = Date.now();
      setDuration(0);

      // Update duration every second
      timerRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      return true;
    } catch (err) {
      console.error("Error starting recording:", err);
      setPermissionError("Unable to start recording.");
      return false;
    }
  }, [hasMic, audioUrl]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return true;
    }
    return false;
  }, [isRecording]);

  // Discard current recording
  const discardRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl("");
    setDuration(0);
  }, [audioUrl]);

  // Format duration as MM:SS
  const formatDuration = useCallback((secs) => {
    const mins = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  return {
    isRecording,
    hasMic,
    permissionError,
    audioBlob,
    audioUrl,
    duration,
    formattedDuration: formatDuration(duration),
    micLevel, // Real-time mic level (0-1)
    startRecording,
    stopRecording,
    discardRecording,
    requestMicAccess,
  };
}

export default useAudioRecorder;







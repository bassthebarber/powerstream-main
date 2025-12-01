// frontend/studio-app/src/hooks/useAudioRecorder.js
// Custom hook for audio recording functionality

import { useState, useRef, useCallback, useEffect } from "react";

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasMic, setHasMic] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState("");
  const [duration, setDuration] = useState(0);

  const mediaStreamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Request microphone access
  const requestMicAccess = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setHasMic(true);
      setPermissionError("");
      return true;
    } catch (err) {
      console.error("Mic permission error:", err);
      setPermissionError("Microphone access denied. Enable mic permissions in your browser.");
      setHasMic(false);
      return false;
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
    startRecording,
    stopRecording,
    discardRecording,
    requestMicAccess,
  };
}

export default useAudioRecorder;




// frontend/src/studio/StudioAudioContext.jsx
// Shared Audio Context for Studio components

import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from "react";

const StudioAudioContext = createContext(null);

export function StudioAudioProvider({ children }) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const audioElementRef = useRef(null);
  const audioRef = useRef(null); // Shared audio element ref for external components
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [volume, setVolume] = useState(1);
  const [isConnected, setIsConnected] = useState(false);
  
  // Initialize AudioContext lazily (requires user interaction)
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);
  
  // Get or create analyser node
  const getAnalyser = useCallback(() => {
    if (!analyserRef.current) {
      const ctx = getAudioContext();
      analyserRef.current = ctx.createAnalyser();
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.8;
      analyserRef.current.connect(ctx.destination);
    }
    return analyserRef.current;
  }, [getAudioContext]);
  
  // Connect an audio element to the analyser
  const connectAudioElement = useCallback((audioElement) => {
    if (!audioElement) return;
    
    const ctx = getAudioContext();
    const analyser = getAnalyser();
    
    // Disconnect previous source
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        // Already disconnected
      }
    }
    
    // Create new source from audio element
    sourceRef.current = ctx.createMediaElementSource(audioElement);
    sourceRef.current.connect(analyser);
    
    audioElementRef.current = audioElement;
  }, [getAudioContext, getAnalyser]);
  
  // Play audio from URL
  const playAudio = useCallback((url, metadata = {}) => {
    const ctx = getAudioContext();
    
    // Create or reuse audio element
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.crossOrigin = "anonymous";
      connectAudioElement(audioElementRef.current);
    }
    
    audioElementRef.current.src = url;
    audioElementRef.current.volume = volume;
    audioElementRef.current.play();
    
    setIsPlaying(true);
    setCurrentTrack({ url, ...metadata });
    
    audioElementRef.current.onended = () => {
      setIsPlaying(false);
      setCurrentTrack(null);
    };
    
    audioElementRef.current.onerror = (e) => {
      console.error("[StudioAudio] Error:", e);
      setIsPlaying(false);
    };
  }, [getAudioContext, connectAudioElement, volume]);
  
  // Stop current audio
  const stopAudio = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);
  
  // Pause/resume
  const togglePlayPause = useCallback(() => {
    if (!audioElementRef.current) return;
    
    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, [isPlaying]);
  
  // Update volume
  const updateVolume = useCallback((newVolume) => {
    setVolume(newVolume);
    if (audioElementRef.current) {
      audioElementRef.current.volume = newVolume;
    }
  }, []);
  
  // Get frequency data for visualizer
  const getFrequencyData = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return new Uint8Array(0);
    
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
  }, []);
  
  // Get time domain data for waveform
  const getTimeDomainData = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return new Uint8Array(0);
    
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(data);
    return data;
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Set current track with optional auto-play
  const setCurrentTrackAndPlay = useCallback((track, autoPlay = false) => {
    setCurrentTrack(track);
    
    if (track?.audioUrl && autoPlay) {
      playAudio(track.audioUrl, track);
    }
  }, [playAudio]);

  // Initialize audio element on mount
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.crossOrigin = "anonymous";
    }
  }, []);

  const value = {
    audioContext: audioContextRef.current,
    analyser: analyserRef.current,
    audioElement: audioElementRef.current,
    audioRef, // Shared ref for external audio element
    
    // State
    isPlaying,
    currentTrack,
    volume,
    isConnected,
    
    // Methods
    getAudioContext,
    getAnalyser,
    connectAudioElement,
    playAudio,
    stopAudio,
    togglePlayPause,
    updateVolume,
    getFrequencyData,
    getTimeDomainData,
    setCurrentTrack,
    setCurrentTrackAndPlay,
  };
  
  return (
    <StudioAudioContext.Provider value={value}>
      {children}
    </StudioAudioContext.Provider>
  );
}

export function useStudioAudio() {
  const context = useContext(StudioAudioContext);
  if (!context) {
    throw new Error("useStudioAudio must be used within a StudioAudioProvider");
  }
  return context;
}

export default StudioAudioContext;


// frontend/studio-app/src/context/StudioSessionContext.jsx
// Global Studio Session State - Shares beat/session data across all studio pages

import React, { createContext, useContext, useState, useCallback } from "react";

// Default empty beat structure
const EMPTY_BEAT = {
  id: null,
  name: "",
  bpm: 90,
  key: "C minor",
  style: "trap",
  mood: "dark",
  bars: 16,
  audioUrl: null,
  pattern: null,
  createdAt: null,
  status: "idle", // idle | generating | ready | error
};

// Default empty pattern (16 steps x 4 tracks)
const createEmptyPattern = () => ({
  kick: new Array(16).fill(false),
  snare: new Array(16).fill(false),
  hat: new Array(16).fill(false),
  perc: new Array(16).fill(false),
});

// Context
const StudioSessionContext = createContext(null);

// Provider
export function StudioSessionProvider({ children }) {
  // Current beat state
  const [currentBeat, setCurrentBeat] = useState(EMPTY_BEAT);
  
  // Pattern grid state
  const [pattern, setPattern] = useState(createEmptyPattern);
  
  // Session history (for undo/recent beats)
  const [recentBeats, setRecentBeats] = useState([]);
  
  // Loading/status
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  // Load a beat into the session
  const loadBeat = useCallback((beat) => {
    setCurrentBeat({
      ...EMPTY_BEAT,
      ...beat,
      status: beat.audioUrl ? "ready" : "idle",
    });
    
    // Load pattern if available
    if (beat.pattern) {
      setPattern(beat.pattern);
    }
    
    setLastError(null);
    setStatusMessage("Beat loaded");
  }, []);

  // Clear the current beat
  const clearBeat = useCallback(() => {
    setCurrentBeat(EMPTY_BEAT);
    setPattern(createEmptyPattern());
    setStatusMessage("");
    setLastError(null);
  }, []);

  // Update beat properties
  const updateBeat = useCallback((updates) => {
    setCurrentBeat(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  // Update pattern
  const updatePattern = useCallback((newPattern) => {
    setPattern(newPattern);
    setCurrentBeat(prev => ({
      ...prev,
      pattern: newPattern,
    }));
  }, []);

  // Toggle a single step in the pattern
  const toggleStep = useCallback((track, step) => {
    setPattern(prev => ({
      ...prev,
      [track]: prev[track].map((val, i) => i === step ? !val : val),
    }));
  }, []);

  // Add to recent beats
  const addToRecent = useCallback((beat) => {
    setRecentBeats(prev => {
      const filtered = prev.filter(b => b.id !== beat.id);
      return [beat, ...filtered].slice(0, 10); // Keep last 10
    });
  }, []);

  // Set generation status
  const setGenerationStatus = useCallback((status, message = "") => {
    setIsGenerating(status === "generating");
    setCurrentBeat(prev => ({ ...prev, status }));
    setStatusMessage(message);
  }, []);

  // Set error
  const setError = useCallback((error) => {
    setLastError(error);
    setCurrentBeat(prev => ({ ...prev, status: "error" }));
    setIsGenerating(false);
  }, []);

  // Get the current beat for navigation (to pass via route state)
  const getBeatForNavigation = useCallback(() => {
    if (!currentBeat.id && !currentBeat.audioUrl) {
      return null;
    }
    return {
      id: currentBeat.id,
      name: currentBeat.name,
      bpm: currentBeat.bpm,
      key: currentBeat.key,
      style: currentBeat.style,
      mood: currentBeat.mood,
      audioUrl: currentBeat.audioUrl,
      pattern: pattern,
    };
  }, [currentBeat, pattern]);

  const value = {
    // State
    currentBeat,
    pattern,
    recentBeats,
    isGenerating,
    lastError,
    statusMessage,
    
    // Actions
    loadBeat,
    clearBeat,
    updateBeat,
    updatePattern,
    toggleStep,
    addToRecent,
    setGenerationStatus,
    setError,
    getBeatForNavigation,
    
    // Helpers
    createEmptyPattern,
  };

  return (
    <StudioSessionContext.Provider value={value}>
      {children}
    </StudioSessionContext.Provider>
  );
}

// Hook
export function useStudioSession() {
  const context = useContext(StudioSessionContext);
  if (!context) {
    throw new Error("useStudioSession must be used within StudioSessionProvider");
  }
  return context;
}

export default StudioSessionContext;






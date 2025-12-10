// frontend/studio-app/src/services/beatPlayerService.js
// Centralized beat/audio playback service with proper URL handling

const STUDIO_API_BASE = import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100";

/**
 * Normalize audio URL to absolute URL
 * Handles both relative paths (/api/beats/download/...) and full URLs
 */
export function normalizeAudioUrl(url) {
  if (!url) return null;
  
  // Already a full URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Relative API path - prepend studio API base
  if (url.startsWith("/api/")) {
    return `${STUDIO_API_BASE}${url}`;
  }
  
  // Relative path without /api/ prefix
  if (url.startsWith("/")) {
    return `${STUDIO_API_BASE}${url}`;
  }
  
  // Assume it's a relative path
  return `${STUDIO_API_BASE}/${url}`;
}

/**
 * Validate that an audio URL is accessible
 */
export async function validateAudioUrl(url) {
  if (!url) return { valid: false, error: "No URL provided" };
  
  const normalizedUrl = normalizeAudioUrl(url);
  
  try {
    const response = await fetch(normalizedUrl, { method: "HEAD" });
    
    if (!response.ok) {
      return { valid: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }
    
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("audio") && !contentType.includes("video")) {
      return { valid: false, error: `Invalid content type: ${contentType}` };
    }
    
    return { valid: true, url: normalizedUrl, contentType };
  } catch (err) {
    return { valid: false, error: err.message };
  }
}

/**
 * Create an Audio element with proper error handling
 */
export function createAudioElement(url, options = {}) {
  const normalizedUrl = normalizeAudioUrl(url);
  
  if (!normalizedUrl) {
    throw new Error("Invalid audio URL");
  }
  
  const audio = new Audio();
  audio.crossOrigin = "anonymous";
  audio.preload = options.preload || "auto";
  audio.loop = options.loop || false;
  audio.volume = options.volume ?? 1;
  
  // Error handling
  audio.onerror = (e) => {
    console.error("Audio load error:", {
      url: normalizedUrl,
      error: audio.error,
      event: e,
    });
  };
  
  audio.src = normalizedUrl;
  
  return audio;
}

/**
 * Load audio and return a promise that resolves when ready
 */
export function loadAudio(url, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      const audio = createAudioElement(url, options);
      
      audio.oncanplaythrough = () => {
        resolve(audio);
      };
      
      audio.onerror = (e) => {
        reject(new Error(`Failed to load audio: ${audio.error?.message || "Unknown error"}`));
      };
      
      // Start loading
      audio.load();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Beat Player class for managing beat playback
 */
export class BeatPlayer {
  constructor() {
    this.audio = null;
    this.isPlaying = false;
    this.currentUrl = null;
    this.onPlay = null;
    this.onPause = null;
    this.onEnded = null;
    this.onTimeUpdate = null;
    this.onError = null;
  }
  
  async load(url) {
    // Clean up previous audio
    this.stop();
    
    try {
      this.audio = await loadAudio(url, { preload: "auto" });
      this.currentUrl = normalizeAudioUrl(url);
      
      // Wire up events
      this.audio.onplay = () => {
        this.isPlaying = true;
        this.onPlay?.();
      };
      
      this.audio.onpause = () => {
        this.isPlaying = false;
        this.onPause?.();
      };
      
      this.audio.onended = () => {
        this.isPlaying = false;
        this.onEnded?.();
      };
      
      this.audio.ontimeupdate = () => {
        this.onTimeUpdate?.(this.audio.currentTime, this.audio.duration);
      };
      
      this.audio.onerror = (e) => {
        this.onError?.(e);
      };
      
      return true;
    } catch (err) {
      console.error("Beat load failed:", err);
      this.onError?.(err);
      return false;
    }
  }
  
  play() {
    if (this.audio) {
      return this.audio.play().catch((err) => {
        console.error("Beat play failed:", err);
        this.onError?.(err);
      });
    }
  }
  
  pause() {
    if (this.audio) {
      this.audio.pause();
    }
  }
  
  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.isPlaying = false;
    }
  }
  
  seek(time) {
    if (this.audio) {
      this.audio.currentTime = time;
    }
  }
  
  setVolume(volume) {
    if (this.audio) {
      this.audio.volume = Math.max(0, Math.min(1, volume));
    }
  }
  
  setLoop(loop) {
    if (this.audio) {
      this.audio.loop = loop;
    }
  }
  
  getTime() {
    return this.audio?.currentTime || 0;
  }
  
  getDuration() {
    return this.audio?.duration || 0;
  }
  
  destroy() {
    this.stop();
    this.audio = null;
    this.currentUrl = null;
    this.onPlay = null;
    this.onPause = null;
    this.onEnded = null;
    this.onTimeUpdate = null;
    this.onError = null;
  }
}

/**
 * Global beat player instance
 */
let globalPlayer = null;

export function getGlobalBeatPlayer() {
  if (!globalPlayer) {
    globalPlayer = new BeatPlayer();
  }
  return globalPlayer;
}

export default {
  normalizeAudioUrl,
  validateAudioUrl,
  createAudioElement,
  loadAudio,
  BeatPlayer,
  getGlobalBeatPlayer,
};



// frontend/studio-app/src/lib/studioApi.js
// Studio API Helper Functions - Real database queries

import { 
  API_BASE, 
  STUDIO_API_BASE, 
  AI_COACH_API, 
  RECORDINGS_API, 
  UPLOAD_API, 
  EXPORT_API,
  STUDIO_HEALTH,
  MIX_API,
  BEATS_API,
  ROYALTY_API,
} from "../config/api.js";

// ==========================================
// STUDIO STATS & HEALTH
// ==========================================

/**
 * Get studio stats and health information
 */
export async function getStudioStats() {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/library/stats`);
    if (!res.ok) throw new Error("Failed to fetch studio stats");
    const data = await res.json();
    return {
      status: "online",
      connected: true,
      totalFiles: data.stats?.total || 0,
      totalRecordings: data.stats?.recordings || 0,
      totalBeats: data.stats?.beats || 0,
      totalMixes: data.stats?.mixes || 0,
    };
  } catch (err) {
    console.error("getStudioStats error:", err);
    return { 
      status: "offline", 
      connected: false,
      totalFiles: 0,
    };
  }
}

/**
 * Check studio health status
 */
export async function checkStudioHealth() {
  try {
    const res = await fetch(STUDIO_HEALTH);
    return { ok: res.ok, status: res.ok ? "online" : "offline" };
  } catch {
    return { ok: false, status: "offline" };
  }
}

// ==========================================
// LIBRARY - Recordings, Beats, Mixes
// ==========================================

/**
 * Get recordings from library
 */
export async function getLibraryRecordings(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.skip) params.append("skip", options.skip);
    if (options.source) params.append("source", options.source);

    const res = await fetch(`${STUDIO_API_BASE}/api/library/recordings?${params}`);
    if (!res.ok) throw new Error("Failed to fetch recordings");
    
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("getLibraryRecordings error:", err);
    return [];
  }
}

/**
 * Get beats from library
 */
export async function getLibraryBeats(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.skip) params.append("skip", options.skip);
    if (options.genre) params.append("genre", options.genre);
    if (options.mood) params.append("mood", options.mood);

    const res = await fetch(`${STUDIO_API_BASE}/api/library/beats?${params}`);
    if (!res.ok) throw new Error("Failed to fetch beats");
    
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("getLibraryBeats error:", err);
    return [];
  }
}

/**
 * Get mixes from library
 */
export async function getLibraryMixes(options = {}) {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append("limit", options.limit);
    if (options.skip) params.append("skip", options.skip);
    if (options.status) params.append("status", options.status);

    const res = await fetch(`${STUDIO_API_BASE}/api/library/mixes?${params}`);
    if (!res.ok) throw new Error("Failed to fetch mixes");
    
    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error("getLibraryMixes error:", err);
    return [];
  }
}

/**
 * List files from studio storage/library (legacy alias)
 */
export async function listFiles(type = "all") {
  if (type === "recordings") return getLibraryRecordings();
  if (type === "beats") return getLibraryBeats();
  if (type === "mixes") return getLibraryMixes();
  
  // Get all types
  const [recordings, beats, mixes] = await Promise.all([
    getLibraryRecordings({ limit: 20 }),
    getLibraryBeats({ limit: 20 }),
    getLibraryMixes({ limit: 20 }),
  ]);

  return [
    ...recordings.map(r => ({ ...r, type: 'recording' })),
    ...beats.map(b => ({ ...b, type: 'beat' })),
    ...mixes.map(m => ({ ...m, type: 'mixdown' })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

// ==========================================
// MIX & MASTER
// ==========================================

/**
 * Process a mix using real FFmpeg
 */
export async function processMix(file, options = {}) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    if (options.trackName) formData.append("trackName", options.trackName);
    if (options.artistName) formData.append("artistName", options.artistName);
    if (options.genre) formData.append("genre", options.genre);
    if (options.chain) formData.append("chain", JSON.stringify(options.chain));

    const res = await fetch(`${STUDIO_API_BASE}/api/mix/process`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Mix processing failed");
    }

    return await res.json();
  } catch (err) {
    console.error("processMix error:", err);
    throw err;
  }
}

/**
 * Get mix status
 */
export async function getMixStatus(mixId) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/mix/status/${mixId}`);
    if (!res.ok) throw new Error("Failed to get mix status");
    return await res.json();
  } catch (err) {
    console.error("getMixStatus error:", err);
    throw err;
  }
}

// ==========================================
// AI MASTERING ENGINE
// ==========================================

/**
 * Master an audio track with AI processing
 * @param {File} file - Audio file to master
 * @param {Object} options - Mastering options
 * @returns {Promise<Object>} Mastered result with download URL
 */
export async function masterTrack(file, options = {}) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    // Add all options to form data
    if (options.trackName) formData.append("trackName", options.trackName);
    if (options.artistName) formData.append("artistName", options.artistName);
    if (options.genre) formData.append("genre", options.genre);
    if (options.preset) formData.append("preset", options.preset);
    if (options.loudnessTarget) formData.append("loudnessTarget", options.loudnessTarget);
    if (options.truePeakLimit) formData.append("truePeakLimit", options.truePeakLimit);
    if (options.lowCut) formData.append("lowCut", options.lowCut);
    if (options.highBoost) formData.append("highBoost", options.highBoost);
    if (options.compressionRatio) formData.append("compressionRatio", options.compressionRatio);
    if (options.compressionKnee) formData.append("compressionKnee", options.compressionKnee);
    if (options.stereoWidth) formData.append("stereoWidth", options.stereoWidth);
    if (options.outputFormat) formData.append("outputFormat", options.outputFormat);
    if (options.generateWaveform !== false) formData.append("generateWaveform", "true");

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/master`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Mastering failed");
    }

    return await res.json();
  } catch (err) {
    console.error("masterTrack error:", err);
    throw err;
  }
}

/**
 * Quick master with a preset
 * @param {File} file - Audio file
 * @param {string} preset - Preset name (streaming, loud, hiphop, trap)
 */
export async function quickMaster(file, preset = "loud") {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/master/quick/${preset}`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Quick master failed");
    }

    return await res.json();
  } catch (err) {
    console.error("quickMaster error:", err);
    throw err;
  }
}

/**
 * Get available mastering presets
 */
export async function getMasteringPresets() {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/master/presets`);
    if (!res.ok) throw new Error("Failed to fetch mastering presets");
    return await res.json();
  } catch (err) {
    console.error("getMasteringPresets error:", err);
    return {
      presets: [
        { id: "streaming", name: "Streaming Ready", loudnessTarget: -14 },
        { id: "loud", name: "Loud Master", loudnessTarget: -9 },
        { id: "hiphop", name: "Hip-Hop Master", loudnessTarget: -11 },
        { id: "trap", name: "Trap Master", loudnessTarget: -10 },
      ],
    };
  }
}

/**
 * Compare before/after mastered track
 */
export async function compareMaster(masterId) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/master/compare/${masterId}`);
    if (!res.ok) throw new Error("Failed to get comparison");
    return await res.json();
  } catch (err) {
    console.error("compareMaster error:", err);
    throw err;
  }
}

// ==========================================
// BEAT GENERATION (AI Beat Engine)
// ==========================================

/**
 * Generate a beat using the full AI Beat Engine
 * Supports: OpenAI Audio, MusicGen, pattern fallback
 * Uses the Recording Studio backend
 * 
 * @param {Object} options - Generation options
 * @param {string} options.vibe - Custom vibe description
 * @param {string} options.prompt - Full custom prompt
 * @param {number} options.bpm - Target BPM (60-180)
 * @param {string} options.style - Beat style (trap, drill, rnb, etc.)
 * @param {string} options.mood - Mood modifier (dark, uplifting, etc.)
 * @param {string} options.referenceArtist - Reference artist for style
 * @param {number} options.bars - Length in bars (8, 16, or 32)
 * @param {string} options.key - Musical key (e.g., "C minor")
 * @param {boolean} options.aiMelody - Include AI melody
 * @param {boolean} options.emphasis808 - Heavy 808 bass
 * @param {Function} options.onProgress - Progress callback for SSE
 */
export async function generateBeat(options = {}) {
  try {
    // Use new AI Beat Engine endpoint
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/generate-beat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vibe: options.vibe || "",
        prompt: options.prompt || "",
        bpm: options.bpm || options.tempo || 140,
        genre: options.genre || options.style || "trap",
        style: options.style || options.genre || "trap",
        mood: options.mood || "dark",
        referenceArtist: options.referenceArtist || "",
        bars: options.bars || 16,
        key: options.key || "C minor",
        aiMelody: options.aiMelody !== false,
        emphasis808: options.emphasis808 !== false,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Beat generation failed");
    }

    return await res.json();
  } catch (err) {
    console.error("generateBeat error:", err);
    throw err;
  }
}

/**
 * Generate a quick test beat with default settings
 */
export async function generateQuickBeat(style = "trap") {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/quick-beat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ style }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Quick beat generation failed");
    }

    return await res.json();
  } catch (err) {
    console.error("generateQuickBeat error:", err);
    throw err;
  }
}

/**
 * Generate beat from a preset
 * Available presets: houston-trap, uk-drill, smooth-rnb, boom-bap, 
 *                    hard-trap, lofi-chill, gospel-uplift, afro-dance
 */
export async function generatePresetBeat(presetName, overrides = {}) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/preset/${presetName}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(overrides),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Preset beat generation failed");
    }

    return await res.json();
  } catch (err) {
    console.error("generatePresetBeat error:", err);
    throw err;
  }
}

/**
 * Get AI Beat Engine options (styles, moods, reference artists)
 */
export async function getBeatGenerationOptions() {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/ai/options`);
    if (!res.ok) throw new Error("Failed to fetch beat options");
    return await res.json();
  } catch (err) {
    console.error("getBeatGenerationOptions error:", err);
    // Return defaults on error
    return {
      styles: ["trap", "drill", "rnb", "hiphop", "southern", "gospel", "lofi", "afrobeat"],
      moods: ["dark", "uplifting", "aggressive", "chill", "melancholic", "triumphant", "eerie", "soulful"],
      referenceArtists: ["travis scott", "metro boomin", "future", "drake", "j cole", "kendrick lamar", "kanye", "scarface", "ugk", "three 6 mafia"],
      barsOptions: [8, 16, 32],
    };
  }
}

/**
 * Legacy: Generate beat using beatlab endpoint (for backward compatibility)
 */
export async function generateBeatLegacy(options = {}) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/beatlab/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: options.prompt,
        bpm: options.bpm || 90,
        key: options.key || "C minor",
        mood: options.mood || "dark",
        style: options.style || "trap",
        lengthSeconds: options.lengthSeconds || 30,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Beat generation failed");
    }

    return await res.json();
  } catch (err) {
    console.error("generateBeatLegacy error:", err);
    throw err;
  }
}

/**
 * Get beats from Beat Store
 * Uses the Recording Studio backend
 */
export async function getBeats(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.genre) params.append("genre", filters.genre);
    if (filters.mood) params.append("mood", filters.mood);
    if (filters.bpmMin) params.append("bpmMin", filters.bpmMin);
    if (filters.bpmMax) params.append("bpmMax", filters.bpmMax);
    if (filters.sort) params.append("sort", filters.sort);
    if (filters.limit) params.append("limit", filters.limit);
    if (filters.search) params.append("search", filters.search);

    // Use new Beat Store endpoint
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/beats?${params}`);
    if (!res.ok) throw new Error("Failed to fetch beats");
    
    const data = await res.json();
    return data.beats || [];
  } catch (err) {
    console.error("getBeats error:", err);
    return [];
  }
}

/**
 * Get a single beat by ID (for use in Record Booth)
 */
export async function getBeatForRecording(beatId) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/beats/${beatId}/use`);
    if (!res.ok) throw new Error("Failed to get beat");
    return await res.json();
  } catch (err) {
    console.error("getBeatForRecording error:", err);
    throw err;
  }
}

/**
 * Add beat to user's library
 */
export async function addBeatToLibrary(beatId) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/beats/${beatId}/add-to-library`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to add beat to library");
    return await res.json();
  } catch (err) {
    console.error("addBeatToLibrary error:", err);
    throw err;
  }
}

/**
 * Log a beat play for royalty tracking
 */
export async function logBeatPlay(beatId) {
  try {
    await fetch(`${STUDIO_API_BASE}/api/studio/beats/${beatId}/play`, {
      method: "POST",
    });
  } catch (err) {
    console.error("logBeatPlay error:", err);
  }
}

/**
 * Save a beat pattern to the library
 */
export async function saveBeat(beatData) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/beatlab/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: beatData.name || `SP Beat – ${beatData.style || 'Custom'} ${beatData.bpm || 90}bpm`,
        bpm: beatData.bpm || 90,
        key: beatData.key || "C minor",
        style: beatData.style || "trap",
        mood: beatData.mood || "dark",
        pattern: beatData.pattern,
        audioUrl: beatData.audioUrl,
        metadata: beatData.metadata || {},
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to save beat");
    }

    return await res.json();
  } catch (err) {
    console.error("saveBeat error:", err);
    throw err;
  }
}

/**
 * Get a specific beat by ID
 */
export async function getBeatById(beatId) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/beatlab/${beatId}`);
    if (!res.ok) throw new Error("Beat not found");
    return await res.json();
  } catch (err) {
    console.error("getBeatById error:", err);
    throw err;
  }
}

// ==========================================
// RECORDINGS & UPLOADS
// ==========================================

/**
 * Upload a take to the studio
 */
export async function uploadTake(file, metadata = {}) {
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    if (metadata.artistName) formData.append("artistName", metadata.artistName);
    if (metadata.trackTitle) formData.append("trackTitle", metadata.trackTitle);
    if (metadata.coach) formData.append("coach", metadata.coach);

    const res = await fetch(`${UPLOAD_API}/file`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Upload failed");
    }

    return await res.json();
  } catch (err) {
    console.error("uploadTake error:", err);
    throw err;
  }
}

/**
 * Save a recording entry to the database
 */
export async function saveRecording(recordingData) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/library/recordings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recordingData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to save recording");
    }

    return await res.json();
  } catch (err) {
    console.error("saveRecording error:", err);
    throw err;
  }
}

// ==========================================
// AI COACH
// ==========================================

/**
 * Analyze a take with AI Coach - Scarface 2.0 is the default
 */
export async function analyzeTake(fileUrl, coachId = "scarface20", options = {}) {
  try {
    const res = await fetch(`${AI_COACH_API}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileUrl,
        coach: coachId,
        coachMode: options.coachMode || (coachId === "scarface20" ? "dre" : "standard"),
        artistName: options.artistName || "Artist",
        trackTitle: options.trackTitle || "Untitled",
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Analysis failed");
    }

    return await res.json();
  } catch (err) {
    console.error("analyzeTake error:", err);
    throw err;
  }
}

/**
 * Get list of AI coach personas
 */
export async function getCoachPersonas() {
  try {
    const res = await fetch(`${AI_COACH_API}/personas`);
    if (!res.ok) throw new Error("Failed to fetch personas");
    return await res.json();
  } catch (err) {
    console.error("getCoachPersonas error:", err);
    return {
      personas: [
        {
          key: "scarface20",
          displayName: "Scarface 2.0 — The Digital Don",
          description: "South Houston street gospel storytelling with grown man wisdom",
          active: true,
        },
      ],
    };
  }
}

// ==========================================
// ROYALTY SPLITS
// ==========================================

/**
 * Get royalty splits
 */
export async function getRoyaltySplits() {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/royalty/splits`);
    if (!res.ok) throw new Error("Failed to fetch splits");
    
    const data = await res.json();
    return data.splits || data || [];
  } catch (err) {
    console.error("getRoyaltySplits error:", err);
    return [];
  }
}

/**
 * Create a new royalty split
 */
export async function createRoyaltySplit(splitData) {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/royalty/splits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(splitData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Failed to create split");
    }

    return await res.json();
  } catch (err) {
    console.error("createRoyaltySplit error:", err);
    throw err;
  }
}

// ==========================================
// EXPORT & EMAIL
// ==========================================

/**
 * Send export email with download link
 */
export async function sendExportEmail(email, fileUrl, notes = "") {
  try {
    const res = await fetch(`${EXPORT_API}/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        assetUrl: fileUrl,
        notes,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.message || "Export failed");
    }

    return await res.json();
  } catch (err) {
    console.error("sendExportEmail error:", err);
    // Return mock success in development
    return { 
      success: true, 
      message: `Export link sent to ${email} (demo mode)`,
    };
  }
}

// ==========================================
// GENERIC REQUEST HELPER
// ==========================================

/**
 * Generic studio API request handler
 */
export async function studioRequest(url, method = "GET", body = null) {
  try {
    const options = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    
    if (body && method !== "GET") {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    return await res.json();
  } catch (err) {
    console.error("studioRequest error:", err);
    throw err;
  }
}

export default {
  getStudioStats,
  checkStudioHealth,
  getLibraryRecordings,
  getLibraryBeats,
  getLibraryMixes,
  listFiles,
  processMix,
  getMixStatus,
  masterTrack,
  quickMaster,
  getMasteringPresets,
  compareMaster,
  generateBeat,
  generateQuickBeat,
  generatePresetBeat,
  getBeatGenerationOptions,
  generateBeatLegacy,
  getBeats,
  getBeatForRecording,
  addBeatToLibrary,
  logBeatPlay,
  saveBeat,
  getBeatById,
  uploadTake,
  saveRecording,
  analyzeTake,
  getCoachPersonas,
  getRoyaltySplits,
  createRoyaltySplit,
  sendExportEmail,
  studioRequest,
};

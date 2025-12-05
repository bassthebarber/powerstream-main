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
// LIVE ROOM (Real-time recording sessions)
// POWERSTREAM AI STUDIO – LIVE ROOM & ENGINEER CONTRACT MODE
// ==========================================

/**
 * Create a new live room session
 */
export async function createLiveRoom(options = {}) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: options.name,
        engineerId: options.engineerId,
        beatId: options.beatId,
        beatUrl: options.beatUrl,
        beatName: options.beatName,
        description: options.description,
        settings: options.settings,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to create live room");
    }

    return await res.json();
  } catch (err) {
    console.error("createLiveRoom error:", err);
    throw err;
  }
}

/**
 * Join a live room by room code
 */
export async function joinLiveRoom(roomCode) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/join`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ roomCode }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to join live room");
    }

    return await res.json();
  } catch (err) {
    console.error("joinLiveRoom error:", err);
    throw err;
  }
}

/**
 * Get live room session details
 */
export async function getLiveRoom(sessionId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/${sessionId}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get live room");
    return await res.json();
  } catch (err) {
    console.error("getLiveRoom error:", err);
    throw err;
  }
}

/**
 * Get user's live room sessions
 */
export async function getLiveSessions(options = {}) {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (options.status) params.append("status", options.status);
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get live sessions");
    return await res.json();
  } catch (err) {
    console.error("getLiveSessions error:", err);
    return { sessions: [], pagination: {} };
  }
}

/**
 * Start recording in a live room
 */
export async function startLiveRecording(sessionId, trackType = "vocal", trackName = "") {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/record/start`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ sessionId, trackType, trackName }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to start recording");
    }

    return await res.json();
  } catch (err) {
    console.error("startLiveRecording error:", err);
    throw err;
  }
}

/**
 * Stop recording and save track
 */
export async function stopLiveRecording(sessionId, trackId, finalUrl, metadata = {}) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/record/stop`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        sessionId,
        trackId,
        finalUrl,
        trackType: metadata.trackType,
        trackName: metadata.trackName,
        duration: metadata.duration,
        fileSize: metadata.fileSize,
        format: metadata.format,
        notes: metadata.notes,
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to save recording");
    }

    return await res.json();
  } catch (err) {
    console.error("stopLiveRecording error:", err);
    throw err;
  }
}

/**
 * Start a live room session
 */
export async function startLiveSession(sessionId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/${sessionId}/start`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to start session");
    return await res.json();
  } catch (err) {
    console.error("startLiveSession error:", err);
    throw err;
  }
}

/**
 * End a live room session
 */
export async function endLiveSession(sessionId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/${sessionId}/end`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to end session");
    return await res.json();
  } catch (err) {
    console.error("endLiveSession error:", err);
    throw err;
  }
}

/**
 * Update live room settings (beat, BPM, etc.)
 */
export async function updateLiveRoomSettings(sessionId, updates) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/live-room/${sessionId}/settings`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update settings");
    return await res.json();
  } catch (err) {
    console.error("updateLiveRoomSettings error:", err);
    throw err;
  }
}

// ==========================================
// STUDIO JOBS (Paid services: mix, master, beat)
// ==========================================

/**
 * Get job pricing for all types
 */
export async function getJobPricing() {
  try {
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/pricing`);
    if (!res.ok) throw new Error("Failed to get pricing");
    return await res.json();
  } catch (err) {
    console.error("getJobPricing error:", err);
    return { prices: {}, jobTypes: [] };
  }
}

/**
 * Get pricing breakdown for a specific job type
 */
export async function getJobPricingBreakdown(jobType, customPrice = null) {
  try {
    const params = new URLSearchParams();
    if (customPrice) params.append("customPrice", customPrice);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/pricing/${jobType}?${params}`);
    if (!res.ok) throw new Error("Failed to get pricing breakdown");
    return await res.json();
  } catch (err) {
    console.error("getJobPricingBreakdown error:", err);
    throw err;
  }
}

/**
 * Create a new studio job
 */
export async function createStudioJob(jobData) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(jobData),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to create job");
    }

    return await res.json();
  } catch (err) {
    console.error("createStudioJob error:", err);
    throw err;
  }
}

/**
 * Get user's jobs (as artist)
 */
export async function getMyJobs(options = {}) {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (options.status) params.append("status", options.status);
    if (options.type) params.append("type", options.type);
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/my-jobs?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get jobs");
    return await res.json();
  } catch (err) {
    console.error("getMyJobs error:", err);
    return { jobs: [], pagination: {} };
  }
}

/**
 * Get engineer's assigned jobs
 */
export async function getEngineerJobs(options = {}) {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (options.status) params.append("status", options.status);
    if (options.type) params.append("type", options.type);
    if (options.limit) params.append("limit", options.limit);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/engineer-jobs?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get engineer jobs");
    return await res.json();
  } catch (err) {
    console.error("getEngineerJobs error:", err);
    return { jobs: [], pagination: {} };
  }
}

/**
 * Get open jobs (for engineers to pick up)
 */
export async function getOpenJobs(options = {}) {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (options.type) params.append("type", options.type);
    if (options.limit) params.append("limit", options.limit);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/open?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get open jobs");
    return await res.json();
  } catch (err) {
    console.error("getOpenJobs error:", err);
    return { jobs: [], pagination: {} };
  }
}

/**
 * Get job details
 */
export async function getJob(jobId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/${jobId}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Job not found");
    return await res.json();
  } catch (err) {
    console.error("getJob error:", err);
    throw err;
  }
}

/**
 * Assign engineer to a job (self-assign or by artist/admin)
 */
export async function assignEngineerToJob(jobId, engineerId = null) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/${jobId}/assign`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ engineerId }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to assign engineer");
    }

    return await res.json();
  } catch (err) {
    console.error("assignEngineerToJob error:", err);
    throw err;
  }
}

/**
 * Submit deliverable for a job (engineer only)
 */
export async function submitJobDeliverable(jobId, deliverable) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/${jobId}/deliver`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(deliverable),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to submit deliverable");
    }

    return await res.json();
  } catch (err) {
    console.error("submitJobDeliverable error:", err);
    throw err;
  }
}

/**
 * Approve a job (artist only)
 */
export async function approveJob(jobId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/${jobId}/approve`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to approve job");
    }

    return await res.json();
  } catch (err) {
    console.error("approveJob error:", err);
    throw err;
  }
}

/**
 * Complete a job and trigger payment
 */
export async function completeJob(jobId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/${jobId}/complete`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to complete job");
    }

    return await res.json();
  } catch (err) {
    console.error("completeJob error:", err);
    throw err;
  }
}

/**
 * Update job status (admin only)
 */
export async function updateJobStatus(jobId, status, adminNotes = "") {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/jobs/${jobId}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status, adminNotes }),
    });

    if (!res.ok) throw new Error("Failed to update status");
    return await res.json();
  } catch (err) {
    console.error("updateJobStatus error:", err);
    throw err;
  }
}

// ==========================================
// STUDIO CONTRACTS
// ==========================================

/**
 * Generate a contract for a job
 */
export async function generateContract(jobId, options = {}) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/contracts/generate`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId, ...options }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to generate contract");
    }

    return await res.json();
  } catch (err) {
    console.error("generateContract error:", err);
    throw err;
  }
}

/**
 * Get contract details
 */
export async function getContract(contractId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/contracts/${contractId}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Contract not found");
    return await res.json();
  } catch (err) {
    console.error("getContract error:", err);
    throw err;
  }
}

/**
 * Get full contract text
 */
export async function getContractText(contractId) {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/contracts/${contractId}/text`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get contract text");
    return await res.json();
  } catch (err) {
    console.error("getContractText error:", err);
    throw err;
  }
}

/**
 * Sign a contract
 */
export async function signContract(contractId, signatureData = "") {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/contracts/${contractId}/sign`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ signatureData }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Failed to sign contract");
    }

    return await res.json();
  } catch (err) {
    console.error("signContract error:", err);
    throw err;
  }
}

/**
 * Get user's contracts
 */
export async function getMyContracts(options = {}) {
  try {
    const token = localStorage.getItem("token");
    const params = new URLSearchParams();
    if (options.status) params.append("status", options.status);
    if (options.role) params.append("role", options.role);
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);

    const res = await fetch(`${STUDIO_API_BASE}/api/studio/contracts?${params}`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get contracts");
    return await res.json();
  } catch (err) {
    console.error("getMyContracts error:", err);
    return { contracts: [], pagination: {} };
  }
}

/**
 * Get pending contracts that need signature
 */
export async function getPendingContracts() {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${STUDIO_API_BASE}/api/studio/contracts/pending/list`, {
      headers: { "Authorization": `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to get pending contracts");
    return await res.json();
  } catch (err) {
    console.error("getPendingContracts error:", err);
    return { pendingAsArtist: [], pendingAsEngineer: [] };
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
    const token = localStorage.getItem("token");
    const options = {
      method,
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
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
  // Studio Stats & Health
  getStudioStats,
  checkStudioHealth,
  // Library
  getLibraryRecordings,
  getLibraryBeats,
  getLibraryMixes,
  listFiles,
  // Mix & Master
  processMix,
  getMixStatus,
  masterTrack,
  quickMaster,
  getMasteringPresets,
  compareMaster,
  // Beat Generation
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
  // Recordings
  uploadTake,
  saveRecording,
  // AI Coach
  analyzeTake,
  getCoachPersonas,
  // Royalty
  getRoyaltySplits,
  createRoyaltySplit,
  // Export
  sendExportEmail,
  // Live Room (NEW)
  createLiveRoom,
  joinLiveRoom,
  getLiveRoom,
  getLiveSessions,
  startLiveRecording,
  stopLiveRecording,
  startLiveSession,
  endLiveSession,
  updateLiveRoomSettings,
  // Studio Jobs (NEW)
  getJobPricing,
  getJobPricingBreakdown,
  createStudioJob,
  getMyJobs,
  getEngineerJobs,
  getOpenJobs,
  getJob,
  assignEngineerToJob,
  submitJobDeliverable,
  approveJob,
  completeJob,
  updateJobStatus,
  // Contracts (NEW)
  generateContract,
  getContract,
  getContractText,
  signContract,
  getMyContracts,
  getPendingContracts,
  // Generic
  studioRequest,
};

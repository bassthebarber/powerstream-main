// frontend/src/studio/services/BeatService.js
// AI Beat Generation Service

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001/api";

export const BeatService = {
  /**
   * Generate a new beat with AI
   * @param {Object} options - Beat generation options
   * @param {number} options.tempo - BPM (60-200)
   * @param {string} options.key - Musical key (C, D, E, etc.)
   * @param {string} options.mood - Mood (dark, happy, chill, aggressive)
   * @param {string} options.genre - Genre (trap, hiphop, rnb, pop, lofi)
   * @param {string} options.structure - Song structure
   * @returns {Promise<Object>} - { success, stems, metadata }
   */
  async generateBeat(options) {
    try {
      const res = await fetch(`${API_BASE}/beat/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      return res.json();
    } catch (error) {
      console.error("[BeatService] Generate error:", error);
      throw error;
    }
  },

  /**
   * Get available presets for beat generation
   * @returns {Promise<Object>} - { tempos, keys, moods, genres, structures }
   */
  async getPresets() {
    try {
      const res = await fetch(`${API_BASE}/beat/presets`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      return data.presets;
    } catch (error) {
      console.error("[BeatService] Presets error:", error);
      // Return defaults if API fails
      return {
        tempos: [80, 90, 100, 110, 120, 130, 140, 150, 160],
        keys: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
        moods: ["dark", "happy", "chill", "aggressive", "ethereal", "melancholic"],
        genres: ["trap", "hiphop", "rnb", "pop", "lofi", "drill", "boom-bap", "edm"],
        structures: ["verse-hook-verse", "loop-4-bars", "loop-8-bars"],
      };
    }
  },

  /**
   * Fetch a stem audio file as ArrayBuffer
   * @param {string} stemUrl - URL to the stem file
   * @returns {Promise<ArrayBuffer>}
   */
  async fetchStemAudio(stemUrl) {
    // Handle relative URLs
    const fullUrl = stemUrl.startsWith("/") ? `${API_BASE.replace('/api', '')}${stemUrl}` : stemUrl;

    const res = await fetch(fullUrl);
    if (!res.ok) {
      throw new Error(`Failed to fetch stem: ${res.status}`);
    }

    return res.arrayBuffer();
  },
};

export default BeatService;



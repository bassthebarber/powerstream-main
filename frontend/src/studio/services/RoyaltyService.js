// frontend/src/studio/services/RoyaltyService.js
// Royalty tracking service for PowerStream Studio

const API_BASE = import.meta.env.VITE_API_URL?.replace(/\/+$/, "") || "http://localhost:5001/api";

export const RoyaltyService = {
  /**
   * Create a new royalty work from an exported mixdown
   * @param {Object} payload - Work metadata
   * @returns {Promise<Object>}
   */
  async createWorkFromExport(payload) {
    try {
      const res = await fetch(`${API_BASE}/royalty/work-from-export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] createWorkFromExport error:", error);
      throw error;
    }
  },

  /**
   * Log a play/stream event
   * @param {Object} payload - Play event data
   * @returns {Promise<Object>}
   */
  async logPlay(payload) {
    try {
      const res = await fetch(`${API_BASE}/royalty/log-play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] logPlay error:", error);
      throw error;
    }
  },

  /**
   * List all royalty works
   * @param {string} [ownerUserId] - Optional owner filter
   * @returns {Promise<Object>}
   */
  async listWorks(ownerUserId) {
    try {
      const params = ownerUserId ? `?ownerUserId=${ownerUserId}` : "";
      const res = await fetch(`${API_BASE}/royalty/works${params}`);
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] listWorks error:", error);
      throw error;
    }
  },

  /**
   * Get a single royalty work with plays
   * @param {string} id - Work ID
   * @returns {Promise<Object>}
   */
  async getWork(id) {
    try {
      const res = await fetch(`${API_BASE}/royalty/work/${id}`);
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] getWork error:", error);
      throw error;
    }
  },

  /**
   * Update a royalty work
   * @param {string} id - Work ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>}
   */
  async updateWork(id, updates) {
    try {
      const res = await fetch(`${API_BASE}/royalty/work/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] updateWork error:", error);
      throw error;
    }
  },

  /**
   * Delete a royalty work
   * @param {string} id - Work ID
   * @returns {Promise<Object>}
   */
  async deleteWork(id) {
    try {
      const res = await fetch(`${API_BASE}/royalty/work/${id}`, {
        method: "DELETE",
      });
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] deleteWork error:", error);
      throw error;
    }
  },

  /**
   * Get analytics for all works
   * @param {string} [ownerUserId] - Optional owner filter
   * @returns {Promise<Object>}
   */
  async getAnalytics(ownerUserId) {
    try {
      const params = ownerUserId ? `?ownerUserId=${ownerUserId}` : "";
      const res = await fetch(`${API_BASE}/royalty/analytics${params}`);
      return res.json();
    } catch (error) {
      console.error("[RoyaltyService] getAnalytics error:", error);
      throw error;
    }
  },
};

export default RoyaltyService;




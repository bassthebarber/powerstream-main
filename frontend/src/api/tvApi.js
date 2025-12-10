// frontend/src/api/tvApi.js
// TV/Streaming API client
import httpClient from "./httpClient.js";

/**
 * TV API
 */
const tvApi = {
  // ============================================================
  // STATIONS
  // ============================================================

  /**
   * Get all stations
   */
  async getStations(options = {}) {
    const { limit = 50, skip = 0, category, network, isLive } = options;
    const params = new URLSearchParams({ limit, skip });
    if (category) params.append("category", category);
    if (network) params.append("network", network);
    if (typeof isLive === "boolean") params.append("isLive", isLive);
    
    const response = await httpClient.get(`/tv/stations?${params}`);
    return response.data;
  },

  /**
   * Get a station by slug
   */
  async getStation(slug) {
    const response = await httpClient.get(`/tv/stations/${slug}`);
    return response.data;
  },

  /**
   * Get a station by ID
   */
  async getStationById(stationId) {
    const response = await httpClient.get(`/stations/${stationId}`);
    return response.data;
  },

  /**
   * Get live stations
   */
  async getLiveStations(options = {}) {
    const { limit = 20, category, network } = options;
    const params = new URLSearchParams({ limit, isLive: true });
    if (category) params.append("category", category);
    if (network) params.append("network", network);
    
    const response = await httpClient.get(`/tv/stations?${params}`);
    return response.data;
  },

  /**
   * Get featured stations
   */
  async getFeaturedStations(limit = 10) {
    const response = await httpClient.get(`/tv/stations/featured?limit=${limit}`);
    return response.data;
  },

  /**
   * Get stations by category
   */
  async getStationsByCategory(category, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip, category });
    
    const response = await httpClient.get(`/tv/stations?${params}`);
    return response.data;
  },

  /**
   * Get stations by network
   */
  async getStationsByNetwork(network, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip, network });
    
    const response = await httpClient.get(`/tv/stations?${params}`);
    return response.data;
  },

  /**
   * Search stations
   */
  async searchStations(query, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ q: query, limit, skip });
    
    const response = await httpClient.get(`/tv/stations/search?${params}`);
    return response.data;
  },

  /**
   * Follow a station
   */
  async followStation(stationId) {
    const response = await httpClient.post(`/tv/stations/${stationId}/follow`);
    return response.data;
  },

  /**
   * Unfollow a station
   */
  async unfollowStation(stationId) {
    const response = await httpClient.delete(`/tv/stations/${stationId}/follow`);
    return response.data;
  },

  // ============================================================
  // TV GUIDE
  // ============================================================

  /**
   * Get TV guide
   */
  async getTVGuide(options = {}) {
    const { date, network } = options;
    const params = new URLSearchParams();
    if (date) params.append("date", date);
    if (network) params.append("network", network);
    
    const response = await httpClient.get(`/ps-tv/guide?${params}`);
    return response.data;
  },

  /**
   * Get what's on now
   */
  async getWhatsOnNow() {
    const response = await httpClient.get("/ps-tv/now");
    return response.data;
  },

  /**
   * Get upcoming shows
   */
  async getUpcoming(hours = 24) {
    const response = await httpClient.get(`/ps-tv/upcoming?hours=${hours}`);
    return response.data;
  },

  // ============================================================
  // SHOWS
  // ============================================================

  /**
   * Get show details
   */
  async getShow(showId) {
    const response = await httpClient.get(`/shows/${showId}`);
    return response.data;
  },

  /**
   * Get shows for a station
   */
  async getStationShows(stationId, options = {}) {
    const { limit = 20, skip = 0 } = options;
    const params = new URLSearchParams({ limit, skip });
    
    const response = await httpClient.get(`/stations/${stationId}/shows?${params}`);
    return response.data;
  },

  // ============================================================
  // STREAMING
  // ============================================================

  /**
   * Get stream info for a station
   */
  async getStreamInfo(stationId) {
    const response = await httpClient.get(`/stream/${stationId}/info`);
    return response.data;
  },

  /**
   * Start watching (for viewer count)
   */
  async startWatching(stationId) {
    const response = await httpClient.post(`/stream/${stationId}/watch`);
    return response.data;
  },

  /**
   * Stop watching
   */
  async stopWatching(stationId) {
    const response = await httpClient.delete(`/stream/${stationId}/watch`);
    return response.data;
  },

  /**
   * Get viewer count
   */
  async getViewerCount(stationId) {
    const response = await httpClient.get(`/stream/${stationId}/viewers`);
    return response.data;
  },

  // ============================================================
  // VOD (Video on Demand)
  // ============================================================

  /**
   * Get station videos (playlist)
   */
  async getStationVideos(slug) {
    const response = await httpClient.get(`/tv/stations/${slug}/videos`);
    return response.data;
  },

  /**
   * Add video to station playlist
   */
  async addStationVideo(slug, payload) {
    const response = await httpClient.post(`/tv/stations/${slug}/videos`, payload);
    return response.data;
  },

  /**
   * Upload video file to backend (Cloudinary handled server-side)
   * NO signature, NO direct Cloudinary calls - backend handles everything
   * Sends ONLY: video file, title, description, station slug
   */
  async uploadVideo(formData) {
    const response = await httpClient.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 180000, // 180 seconds for large videos
    });
    return response.data;
  },

  /**
   * Update station live status
   */
  async updateStationStatus(slug, payload) {
    const response = await httpClient.patch(`/tv/stations/${slug}/status`, payload);
    return response.data;
  },

  /**
   * Set station to LIVE
   */
  async setStationLive(slug, streamUrl = null) {
    return this.updateStationStatus(slug, { isLive: true, streamUrl });
  },

  /**
   * Set station to OFFLINE
   */
  async setStationOffline(slug) {
    return this.updateStationStatus(slug, { isLive: false });
  },

  /**
   * Get VOD content
   */
  async getVOD(options = {}) {
    const { limit = 20, skip = 0, category, stationId } = options;
    const params = new URLSearchParams({ limit, skip });
    if (category) params.append("category", category);
    if (stationId) params.append("stationId", stationId);
    
    const response = await httpClient.get(`/vod?${params}`);
    return response.data;
  },

  /**
   * Get VOD item
   */
  async getVODItem(vodId) {
    const response = await httpClient.get(`/vod/${vodId}`);
    return response.data;
  },

  // ============================================================
  // MULTISTREAM
  // ============================================================

  /**
   * Get multistream profiles
   */
  async getMultistreamProfiles() {
    const response = await httpClient.get("/multistream/profiles");
    return response.data;
  },

  /**
   * Create multistream profile
   */
  async createMultistreamProfile(data) {
    const response = await httpClient.post("/multistream/profiles", data);
    return response.data;
  },

  /**
   * Start multistream
   */
  async startMultistream(profileId) {
    const response = await httpClient.post(`/multistream/profiles/${profileId}/start`);
    return response.data;
  },

  /**
   * Stop multistream
   */
  async stopMultistream(profileId) {
    const response = await httpClient.post(`/multistream/profiles/${profileId}/stop`);
    return response.data;
  },

  // ============================================================
  // STATION MANAGEMENT (for station owners)
  // ============================================================

  /**
   * Create a station
   */
  async createStation(data) {
    const response = await httpClient.post("/stations", data);
    return response.data;
  },

  /**
   * Update a station
   */
  async updateStation(stationId, data) {
    const response = await httpClient.put(`/stations/${stationId}`, data);
    return response.data;
  },

  /**
   * Delete a station
   */
  async deleteStation(stationId) {
    const response = await httpClient.delete(`/stations/${stationId}`);
    return response.data;
  },

  /**
   * Get station analytics
   */
  async getStationAnalytics(stationId, options = {}) {
    const { startDate, endDate } = options;
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    
    const response = await httpClient.get(`/stations/${stationId}/analytics?${params}`);
    return response.data;
  },
};

export default tvApi;



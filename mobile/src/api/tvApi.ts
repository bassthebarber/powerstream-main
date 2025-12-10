/**
 * TV API
 * Mirrors web client: /api/tv-stations/*, /api/ps-tv/*
 */
import httpClient from './httpClient';

export interface Station {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: string;
  isLive: boolean;
  viewerCount: number;
  owner: {
    id: string;
    name: string;
  };
}

export interface Show {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number;
  category: string;
  stationId: string;
  isLive: boolean;
  scheduledAt?: string;
  videoUrl?: string;
}

export interface LiveStream {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  stationId: string;
  stationName: string;
  viewerCount: number;
  startedAt: string;
  streamUrl: string;
  hlsUrl?: string;
}

export interface VODAsset {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration: number;
  videoUrl: string;
  stationId: string;
  views: number;
  createdAt: string;
}

/**
 * TV API endpoints
 */
export const tvApi = {
  // ============================================================
  // STATIONS
  // ============================================================

  /**
   * Get all stations
   * GET /api/tv-stations
   */
  async getStations(category?: string): Promise<Station[]> {
    const response = await httpClient.get('/tv-stations', {
      params: category ? { category } : undefined,
    });
    return response.data.stations || response.data;
  },

  /**
   * Get featured stations
   * GET /api/tv-stations/featured
   */
  async getFeaturedStations(): Promise<Station[]> {
    const response = await httpClient.get('/tv-stations/featured');
    return response.data.stations || response.data;
  },

  /**
   * Get single station
   * GET /api/tv-stations/:id
   */
  async getStation(stationId: string): Promise<Station> {
    const response = await httpClient.get(`/tv-stations/${stationId}`);
    return response.data.station || response.data;
  },

  /**
   * Get station by slug
   * GET /api/tv-stations/slug/:slug
   */
  async getStationBySlug(slug: string): Promise<Station> {
    const response = await httpClient.get(`/tv-stations/slug/${slug}`);
    return response.data.station || response.data;
  },

  // ============================================================
  // SHOWS
  // ============================================================

  /**
   * Get shows for a station
   * GET /api/tv-stations/:id/shows
   */
  async getStationShows(stationId: string): Promise<Show[]> {
    const response = await httpClient.get(`/tv-stations/${stationId}/shows`);
    return response.data.shows || response.data;
  },

  /**
   * Get show details
   * GET /api/shows/:id
   */
  async getShow(showId: string): Promise<Show> {
    const response = await httpClient.get(`/shows/${showId}`);
    return response.data.show || response.data;
  },

  /**
   * Get upcoming shows
   * GET /api/shows/upcoming
   */
  async getUpcomingShows(): Promise<Show[]> {
    const response = await httpClient.get('/shows/upcoming');
    return response.data.shows || response.data;
  },

  // ============================================================
  // LIVE STREAMS
  // ============================================================

  /**
   * Get live streams
   * GET /api/ps-tv/live
   */
  async getLiveStreams(): Promise<LiveStream[]> {
    const response = await httpClient.get('/ps-tv/live');
    return response.data.streams || response.data;
  },

  /**
   * Get single live stream
   * GET /api/ps-tv/live/:id
   */
  async getLiveStream(streamId: string): Promise<LiveStream> {
    const response = await httpClient.get(`/ps-tv/live/${streamId}`);
    return response.data.stream || response.data;
  },

  /**
   * Join live stream (get viewer token)
   * POST /api/ps-tv/live/:id/join
   */
  async joinLiveStream(streamId: string): Promise<{ viewerToken: string; hlsUrl: string }> {
    const response = await httpClient.post(`/ps-tv/live/${streamId}/join`);
    return response.data;
  },

  /**
   * Leave live stream
   * POST /api/ps-tv/live/:id/leave
   */
  async leaveLiveStream(streamId: string): Promise<void> {
    await httpClient.post(`/ps-tv/live/${streamId}/leave`);
  },

  /**
   * Send reaction in live stream
   * POST /api/ps-tv/live/:id/reaction
   */
  async sendReaction(streamId: string, reaction: string): Promise<void> {
    await httpClient.post(`/ps-tv/live/${streamId}/reaction`, { reaction });
  },

  // ============================================================
  // VOD
  // ============================================================

  /**
   * Get VOD content for station
   * GET /api/vod/station/:stationId
   */
  async getStationVOD(stationId: string): Promise<VODAsset[]> {
    const response = await httpClient.get(`/vod/station/${stationId}`);
    return response.data.assets || response.data;
  },

  /**
   * Get VOD asset
   * GET /api/vod/:id
   */
  async getVODAsset(assetId: string): Promise<VODAsset> {
    const response = await httpClient.get(`/vod/${assetId}`);
    return response.data.asset || response.data;
  },

  /**
   * Get trending VOD
   * GET /api/vod/trending
   */
  async getTrendingVOD(): Promise<VODAsset[]> {
    const response = await httpClient.get('/vod/trending');
    return response.data.assets || response.data;
  },

  /**
   * Log VOD view
   * POST /api/vod/:id/view
   */
  async logVODView(assetId: string, watchDuration: number): Promise<void> {
    await httpClient.post(`/vod/${assetId}/view`, { watchDuration });
  },

  // ============================================================
  // CATEGORIES
  // ============================================================

  /**
   * Get station categories
   * GET /api/tv-stations/categories
   */
  async getCategories(): Promise<string[]> {
    const response = await httpClient.get('/tv-stations/categories');
    return response.data.categories || response.data;
  },
};

export default tvApi;




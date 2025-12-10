// backend/src/domain/models/Station.model.js
// Re-export the main Station model to avoid duplicate model registration
// All Station model imports should use the canonical model at backend/models/Station.js

import Station from '../../../models/Station.js';

// Re-export constants for compatibility
export const STATION_CATEGORIES = {
  MUSIC: "music",
  SPORTS: "sports",
  NEWS: "news",
  ENTERTAINMENT: "entertainment",
  RELIGIOUS: "religious",
  KIDS: "kids",
  MOVIES: "movies",
  DOCUMENTARY: "documentary",
  LIFESTYLE: "lifestyle",
  GAMING: "gaming",
  EDUCATION: "education",
  LOCAL: "local",
  INTERNATIONAL: "international",
};

export const STATION_STATUS = {
  READY: "ready",
  LIVE: "live",
  OFFLINE: "offline",
  MAINTENANCE: "maintenance",
  PENDING: "pending",
};

export const STATION_NETWORKS = {
  SPS: "Southern Power Syndicate",
  PSN: "PowerStream Network",
  INDEPENDENT: "Independent",
};

export default Station;

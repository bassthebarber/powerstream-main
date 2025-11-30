// frontend/src/api/config.js
// Central API configuration for PowerStream

const API_CONFIG = {
  // Your backend API base URL
  BASE_URL: process.env.REACT_APP_API_URL || "http://localhost:5001/api",

  // Endpoints
  ENDPOINTS: {
    AUTH: "/auth",
    CHAT: "/chat",
    FRIENDS: "/friends",
    POWERFEED: "/powerfeed",
    POWERLINE: "/powerline",
    POWERREELS: "/powerreels",
    POWERGRAM: "/powergram",
    TVSTATIONS: "/tvstations",
    PAYMENTS: "/payments"
  },

  // Request timeouts in milliseconds
  TIMEOUT: 15000
};

export default API_CONFIG;

export const BRAND = {
  platformName: import.meta.env.VITE_PLATFORM_NAME || 'PowerStream',
  theme: import.meta.env.VITE_THEME || 'dark',
  logos: {
    primary: import.meta.env.VITE_LOGO_PRIMARY,
    feed: import.meta.env.VITE_LOGO_POWERFEED,
    gram: import.meta.env.VITE_LOGO_POWERGRAM,
    reel: import.meta.env.VITE_LOGO_POWERREEL,
    line: import.meta.env.VITE_LOGO_POWERLINE,
    networks: {
      southern: import.meta.env.VITE_LOGO_SOUTHERN_POWER,
      texas: import.meta.env.VITE_LOGO_TEXAS_GOT_TALENT,
      nolimit: import.meta.env.VITE_LOGO_NO_LIMIT_HOUSTON,
      civic: import.meta.env.VITE_LOGO_CIVIC_CONNECT
    }
  },
  buckets: {
    tv: import.meta.env.VITE_STORAGE_BUCKET || 'tv-stations',
    social: import.meta.env.VITE_SOCIAL_BUCKET || 'social'
  }
};



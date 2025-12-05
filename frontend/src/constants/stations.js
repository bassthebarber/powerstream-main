// PowerStream TV Stations - Standardized Station Data
export const STATIONS = [
  {
    id: 'southern-power-network',
    name: 'Southern Power Network',
    slug: 'southern-power-network',
    logo: '/logos/southernpowernetworklogo.png',
    description: 'The flagship station of Southern Power Syndicate, featuring music videos, local programming, and community content.',
    category: 'Network',
    isLive: true,
    streamUrl: null, // Will be fetched from backend or set via env
  },
  {
    id: 'southern-power-syndicate',
    name: 'Southern Power Syndicate',
    slug: 'southern-power-syndicate',
    logo: '/logos/southernpowernetworklogo.png',
    description: 'Flagship network featuring No Limit East Houston, Texas Got Talent, and Civic Connect.',
    category: 'Network',
    isLive: true,
    streamUrl: null, // Will be fetched from backend or set via env
  },
  {
    id: 'no-limit-east-houston',
    name: 'No Limit East Houston',
    slug: 'no-limit-east-houston',
    logo: '/logos/nolimiteasthoustonlogo.png',
    description: 'Live music, studio sessions, and exclusive artist interviews.',
    category: 'Music',
    isLive: true,
    streamUrl: null, // Will be fetched from backend or set via env
  },
  {
    id: 'texas-got-talent',
    name: 'Texas Got Talent',
    slug: 'texas-got-talent',
    logo: '/logos/texasgottalentlogo.png',
    description: 'Talent competition show featuring local artists and performers.',
    category: 'Competition',
    isLive: false,
    streamUrl: null, // Will be fetched from backend or set via env
  },
  {
    id: 'civic-connect',
    name: 'Civic Connect',
    slug: 'civic-connect',
    logo: '/logos/civicconnectlogo.png',
    description: 'Community news, local events, and civic engagement programming.',
    category: 'News',
    isLive: false,
    streamUrl: null, // Will be fetched from backend or set via env
  },
];

// Helper function to get station by slug
export function getStationBySlug(slug) {
  return STATIONS.find(station => station.slug === slug);
}

// Helper function to get all live stations
export function getLiveStations() {
  return STATIONS.filter(station => station.isLive);
}






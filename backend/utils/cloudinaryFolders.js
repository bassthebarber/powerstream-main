// backend/utils/cloudinaryFolders.js
/**
 * Map station slug or film scope to a Cloudinary folder.
 * This keeps signature signing consistent across the whole app.
 */
export function getStationFolder(slug) {
  if (!slug) return "powerstream/uploads";
  const normalized = String(slug).toLowerCase();
  
  const mapping = {
    "nolimit-east-houston": "powerstream/tv/NoLimitEastHouston",
    "southern-power-network": "powerstream/tv/SouthernPowerNetwork",
    "texas-got-talent": "powerstream/tv/TexasGotTalent",
    "civic-connect": "powerstream/tv/CivicConnect",
    "worldwide-tv": "powerstream/tv/WorldwideTV",
    // Aliases
    "nolimiteasthouston": "powerstream/tv/NoLimitEastHouston",
    "southernpowernetwork": "powerstream/tv/SouthernPowerNetwork",
    "texasgottalent": "powerstream/tv/TexasGotTalent",
    "civicconnect": "powerstream/tv/CivicConnect",
    "worldwidetv": "powerstream/tv/WorldwideTV",
  };

  return mapping[normalized] || `powerstream/tv/${slug}`;
}

/**
 * Folder for PowerStream TV film uploads (Netflix side).
 */
export function getFilmFolder(categorySlug = "general") {
  const normalized = String(categorySlug).toLowerCase().replace(/\s+/g, "-");
  return `powerstream/films/${normalized}`;
}

/**
 * Folder for movie poster uploads
 */
export function getMoviePosterFolder() {
  return "powerstream/movies/posters";
}

/**
 * Folder for movie video uploads
 */
export function getMovieVideoFolder() {
  return "powerstream/movies/videos";
}

/**
 * Folder for movie trailer uploads
 */
export function getMovieTrailerFolder() {
  return "powerstream/movies/trailers";
}

export default {
  getStationFolder,
  getFilmFolder,
  getMoviePosterFolder,
  getMovieVideoFolder,
  getMovieTrailerFolder,
};



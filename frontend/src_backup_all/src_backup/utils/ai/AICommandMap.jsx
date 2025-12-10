const AI_COMMAND_MAP = {
  "build powerfeed": { action: "BUILD_FEED_COMPONENTS" },
  "build powerreels": { action: "BUILD_REELS_COMPONENTS" },
  "build powergram": { action: "BUILD_PHOTO_GRID" },
  "build tv station": { action: "BUILD_TV_LAYOUT" },
  "render civic connect": { action: "LOAD_CIVIC_VIEW" },
  "show leaderboard": { action: "LOAD_LEADERBOARD" },
  "show chat": { action: "LOAD_CHAT" },
  "override now": { action: "TRIGGER_OVERRIDE_MODE" },
  "finalize platform": { action: "COMPLETE_BUILD" },
  "go live": { action: "ACTIVATE_STREAM_MODE" }
};

export default AI_COMMAND_MAP;



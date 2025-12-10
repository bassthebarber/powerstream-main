// frontend/src/components/tv/global/index.js
// Universal TV Components Barrel Export

export { default as RatingStars, RatingCompact } from "./RatingStars.jsx";
export { 
  default as EarningsBadge, 
  EarningsCompact, 
  EarningsProgress, 
  EarningsBreakdown 
} from "./EarningsBadge.jsx";
export { 
  trackView, 
  trackViewOnPlay, 
  updateViewDuration, 
  isViewTracked, 
  getTrackedViewInfo,
  clearViewTracking,
  clearAllViewTracking,
  useViewTracker,
} from "./ViewTracker.js";



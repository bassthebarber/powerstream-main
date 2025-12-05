// backend/controllers/reelController.js
// Thin wrapper so /api/reels can reuse the existing powerReelController logic

import {
  getReels as getReelsImpl,
  createReel as createReelImpl,
  likeReel as likeReelImpl,
  getReelComments as getReelCommentsImpl,
  commentOnReel as commentOnReelImpl,
} from "./powerReelController.js";

export const getReels = getReelsImpl;
export const createReel = createReelImpl;
export const likeReel = likeReelImpl;
export const getReelComments = getReelCommentsImpl;
export const commentOnReel = commentOnReelImpl;

export default {
  getReels,
  createReel,
  likeReel,
  getReelComments,
  commentOnReel,
};
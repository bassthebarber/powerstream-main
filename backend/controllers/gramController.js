// Thin wrapper around powerGramController so /api/gram can reuse the same logic
import {
  getGrams as getGramsImpl,
  createGram as createGramImpl,
  likeGram as likeGramImpl,
  getGramComments as getGramCommentsImpl,
  commentOnGram as commentOnGramImpl,
} from "./powerGramController.js";

export const getGrams = getGramsImpl;
export const createGram = createGramImpl;
export const likeGram = likeGramImpl;
export const getGramComments = getGramCommentsImpl;
export const commentOnGram = commentOnGramImpl;

export default {
  getGrams,
  createGram,
  likeGram,
  getGramComments,
  commentOnGram,
};




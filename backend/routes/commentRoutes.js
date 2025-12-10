import express from "express";
import { addComment, getCommentsByPostId } from "../controllers/commentController.js";

const router = Router();

// POST → Add a comment to a post
router.post("/posts/:postId/comments", addComment);

// GET → Get all comments for a post
router.get("/posts/:postId/comments", getCommentsByPostId);

export default router;

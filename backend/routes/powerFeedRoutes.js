// backend/routes/powerFeedRoutes.js
import { Router } from "express";
import {
  getPosts,
  createPost,
  reactToPost,
  commentOnPost,
} from "../controllers/powerFeedController.js";

const router = Router();

router.get("/posts", getPosts);
router.post("/posts", createPost);
router.post("/posts/:id/react", reactToPost);
router.post("/posts/:id/comment", commentOnPost);

export default router;





import express from "express";
import { getPosts, uploadPost } from "../controllers/powerGramController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import multer from "multer";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.get("/", getPosts);

// ✅ THIS LINE WAS BROKEN — now it's fixed 👇
router.post("/upload", verifyToken, upload.single("image"), uploadPost);

export default router;

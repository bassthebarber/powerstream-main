import express from "express";
import multer from "multer";
import { saveTake } from "../controllers/recordingsController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024 }});

router.post("/", upload.single("audio"), saveTake);

export default router;

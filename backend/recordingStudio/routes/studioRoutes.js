import express from "express";
import { upload } from "../utils/uploader.js";
import * as studioController from "../studioController.js";

const router = express.Router();

router.post("/upload", upload.single("file"), studioController.handleUpload);

export default router;

import multer from "multer";
import path from "path";
import fs from "fs";

// Make sure /uploads folder exists
const uploadPath = path.join(process.cwd(), "backend", "recordingStudio", "uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
  console.log("📁 Created missing folder:", uploadPath);
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const cleanedName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${timestamp}-${cleanedName}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024 // 200MB
  }
});

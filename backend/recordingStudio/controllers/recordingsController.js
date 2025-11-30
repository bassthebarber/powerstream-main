import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

const USE_CLOUDINARY = process.env.USE_CLOUDINARY === "true";

if (USE_CLOUDINARY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
}

export async function saveTake(req, res) {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // temp file for upload
    const tmp = `/tmp/take-${Date.now()}.webm`;
    fs.writeFileSync(tmp, req.file.buffer);

    let url;
    if (USE_CLOUDINARY) {
      const r = await cloudinary.uploader.upload(tmp, {
        resource_type: "video", // works for audio/webm too
        folder: "studio/recordings",
        overwrite: true
      });
      url = r.secure_url;
      fs.unlinkSync(tmp);
    } else {
      // local save fallback
      const outDir = path.join(process.cwd(), "uploads");
      fs.mkdirSync(outDir, { recursive: true });
      const out = path.join(outDir, path.basename(tmp));
      fs.renameSync(tmp, out);
      url = `/uploads/${path.basename(out)}`;
    }

    res.json({ ok: true, url });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Upload failed" });
  }
}

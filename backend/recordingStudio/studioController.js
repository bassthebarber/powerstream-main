// /studio/studioController.js
import fs from "fs";
import path from "path";
import mime from "mime-types";
import Recording from "./RecordingModel.js";
import { cloudinary, cloudEnabled } from "./utils/cloudinary.js";
import { sendDownloadEmail } from "./utils/mailer.js";

const FREE_MODE = String(process.env.FREE_MODE || "true") === "true";

export async function handleUpload(req, res) {
  try {
    if (!req.file) return res.status(400).json({ ok:false, error:"No file" });

    let recordData = {
      ownerEmail: req.body.email || null,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
    };

    if (cloudEnabled) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "powerstream/studio",
        use_filename: true,
        unique_filename: false,
      });
      recordData.storage = "cloudinary";
      recordData.url = uploaded.url;
      recordData.secureUrl = uploaded.secure_url;
      recordData.publicId = uploaded.public_id;
      // cleanup temp file
      fs.unlink(req.file.path, () => {});
    } else {
      // local fallback (not recommended for production)
      const publicUrl = `/downloads/${req.file.filename}`;
      recordData.storage = "local";
      recordData.url = publicUrl;
      recordData.secureUrl = publicUrl;
    }

    const rec = await Recording.create(recordData);

    return res.json({
      ok: true,
      freeMode: FREE_MODE,
      id: rec._id,
      filename: rec.filename,
      url: recordData.secureUrl || recordData.url,
      message: FREE_MODE 
        ? "Uploaded. Free download link ready."
        : "Uploaded. (Payment required before download.)"
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:"Upload failed" });
  }
}

export async function emailLink(req, res) {
  try {
    const { id, to } = req.body;
    const rec = await Recording.findById(id);
    if (!rec) return res.status(404).json({ ok:false, error:"Not found" });

    // In FREE_MODE we send immediately; otherwise you’d verify payment here
    if (!FREE_MODE) return res.status(402).json({ ok:false, error:"Payment required" });

    const url = rec.secureUrl || rec.url;

    await sendDownloadEmail({
      to,
      subject: "Your track from Southern Power AI Studio",
      text: `Download your file: ${url}`,
      html: `
        <div style="font-family:Inter,Arial">
          <h2>Southern Power AI Studio</h2>
          <p>Your track is ready.</p>
          <p><a href="${url}">Click to download</a></p>
        </div>
      `
    });

    return res.json({ ok:true, sent:true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ ok:false, error:"Email failed" });
  }
}

export async function getDownload(req, res) {
  try {
    const { id } = req.params;
    const rec = await Recording.findById(id);
    if (!rec) return res.status(404).send("Not found");

    // Cloudinary: just redirect
    if (rec.storage === "cloudinary") {
      return res.redirect(rec.secureUrl || rec.url);
    }

    // Local: stream file
    const filePath = path.join(process.cwd(), "uploads", rec.filenameOnDisk || "");
    if (!fs.existsSync(filePath)) return res.status(404).send("File missing");
    const mimeType = mime.lookup(filePath) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.setHeader("Content-Disposition", `attachment; filename="${rec.filename}"`);
    fs.createReadStream(filePath).pipe(res);
  } catch (e) {
    console.error(e);
    res.status(500).send("Download error");
  }
}

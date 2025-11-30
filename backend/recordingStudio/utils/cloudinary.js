// /studio/utils/cloudinary.js
import { v2 as cloudinary } from "cloudinary";

const enabled = process.env.USE_CLOUDINARY === "true";

if (enabled) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export { cloudinary, enabled as cloudEnabled };

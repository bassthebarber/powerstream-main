import axios from "axios";

// Axios instance
export const api = axios.create({
  baseURL: "/api", // adjust your backend API base URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// POST JSON helper
export async function postJSON(endpoint, data) {
  try {
    const res = await api.post(endpoint, data);
    return res.data;
  } catch (err) {
    console.error("postJSON error:", err);
    throw err;
  }
}

// Upload to Cloudinary
export async function uploadToCloudinary(file, folder = "studio") {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "your_upload_preset"); // replace with your Cloudinary preset
    formData.append("folder", folder);

    const res = await axios.post(
      "https://api.cloudinary.com/v1_1/your_cloud_name/upload", // replace with your Cloud name
      formData
    );
    return res.data;
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    throw err;
  }
}

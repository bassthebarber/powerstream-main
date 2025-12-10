// frontend/src/utils/infinity/UploadHelpers.js
// Uploads to Cloudinary or custom storage

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();
  return data.url;
};



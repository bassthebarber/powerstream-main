// /frontend/utils/cloudinaryUploader.js
export const uploadToCloudinary = async (file, folder = 'uploads') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET);
  formData.append('folder', folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await res.json();
  return data.secure_url;
};

import React, { useState } from 'react';

export default function UploadTrackPage() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState('');

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert('Select a file first');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'unsigned'); // or your Cloudinary preset

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      const data = await res.json();
      setUrl(data.secure_url);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <h1>Upload Your Track</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {url && (
        <div>
          <p>Uploaded successfully!</p>
          <audio controls src={url} />
        </div>
      )}
    </div>
  );
}

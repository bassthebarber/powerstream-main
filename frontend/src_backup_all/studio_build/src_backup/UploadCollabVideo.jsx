import React from 'react';

export default function UploadCollabVideo() {
  return (
    <div className="upload-collab-video">
      <h2>🎬 Upload Collab Video</h2>
      <input type="file" accept="video/*" />
      <button>Upload</button>
    </div>
  );
}

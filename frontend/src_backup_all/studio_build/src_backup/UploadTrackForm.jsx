import React from 'react';

export default function UploadTrackForm() {
  return (
    <div className="upload-track">
      <h2>📤 Upload Track</h2>
      <form>
        <input type="text" placeholder="Track Title" />
        <input type="file" accept="audio/*" />
        <button>Upload</button>
      </form>
    </div>
  );
}

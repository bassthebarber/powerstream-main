// frontend/src/components/reel/ReelUploadForm.js
import React, { useState } from 'react';

export default function ReelUploadForm({ onUpload }) {
  const [title, setTitle] = useState('');
  const [video, setVideo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!video) return alert('Select a video file.');
    onUpload({ title, video });
    setTitle('');
    setVideo(null);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6">
      <input
        type="text"
        placeholder="Reel title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setVideo(e.target.files[0])}
        className="mb-2"
      />
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Upload Reel
      </button>
    </form>
  );
}



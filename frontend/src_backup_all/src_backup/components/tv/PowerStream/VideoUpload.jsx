import React, { useState } from 'react';

const VideoUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Select a video first');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/powerscreen/video/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert('Video uploaded: ' + data.filename);
    } catch (err) {
      console.error(err);
      alert('Video upload failed');
    }
  };

  return (
    <div className="upload-section">
      <h3>Upload Artist Music Video</h3>
      <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Video</button>
    </div>
  );
};

export default VideoUpload;

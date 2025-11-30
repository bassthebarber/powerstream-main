import React, { useState } from 'react';

const TGUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert('Select a video file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/tgt/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert('Upload success: ' + data.filename);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="tg-upload">
      <h3>🎤 Upload Audition Video</h3>
      <input
        type="file"
        accept="video/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default TGUpload;

import React, { useState } from 'react';

const AudioUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select an audio file');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/powerscreen/audio/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert('Audio uploaded: ' + data.filename);
    } catch (err) {
      console.error(err);
      alert('Audio upload failed');
    }
  };

  return (
    <div className="upload-section">
      <h3>Upload Your Track</h3>
      <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload Audio</button>
    </div>
  );
};

export default AudioUpload;

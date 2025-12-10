import React, { useState } from 'react';

const AudioUploadForm = () => {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (!file) return alert('Select a file first');
    console.log('Uploading file:', file);
    // Hook into Supabase or Cloudinary upload logic here
  };

  return (
    <div>
      <h3>Upload Audio</h3>
      <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default AudioUploadForm;



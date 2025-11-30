import React, { useState } from 'react';

const CivicUpload = () => {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert('Please select a file');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/civic/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      alert('Upload successful: ' + data.filename);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="upload-section">
      <h3>📤 Upload Civic Video / Message</h3>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default CivicUpload;

// frontend/src/components/UploadGround.jsx

import React, { useState } from 'react';

const UploadGround = ({ onUpload }) => {
  const [file, setFile] = useState(null);

  const handleUpload = () => {
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#111', color: '#FFD700' }}>
      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginTop: '10px', background: '#FFD700' }}>
        Upload
      </button>
    </div>
  );
};

export default UploadGround;



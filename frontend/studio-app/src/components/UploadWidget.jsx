import React, { useRef } from "react";

export default function UploadWidget({ onUpload }) {
  const fileInputRef = useRef();

  const handleChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onUpload(file);
  };

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleChange}
        accept="audio/*"
      />
    </div>
  );
}

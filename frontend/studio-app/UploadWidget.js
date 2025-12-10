import React, { useState } from "react";

function UploadWidget() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please choose a file first.");
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5100/api/studio/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setUploadedUrl(data.url);
        alert("✅ Upload successful!");
      } else {
        alert("⚠️ Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error uploading file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-widget">
      <h2>🎵 Upload Your Track</h2>
      <input
        type="file"
        accept="audio/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {uploadedUrl && (
        <div className="uploaded-file">
          <p>File uploaded successfully!</p>
          <audio controls src={uploadedUrl}></audio>
        </div>
      )}
    </div>
  );
}

export default UploadWidget;

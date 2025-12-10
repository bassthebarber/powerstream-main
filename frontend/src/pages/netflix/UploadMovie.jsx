import React, { useState } from "react";
import api from "../../lib/api";
import { useNavigate } from "react-router-dom";
import "./netflix.css";
import "../../components/netflix/netflix.css";

export default function UploadMovie() {
  const navigate = useNavigate();
  const [poster, setPoster] = useState(null);
  const [movieFile, setMovieFile] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [genres, setGenres] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  
  // Pay-per-view fields
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("");

  const uploadToCloud = async (file, folder) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("station", folder);
    formData.append("title", title);

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000, // 5 minutes for large files
    });

    return res.data.videoUrl || res.data.url || res.data.secure_url;
  };

  const handleSubmit = async () => {
    if (!poster || !movieFile || !title) {
      alert("Poster, title, and movie file are required.");
      return;
    }

    try {
      setUploading(true);
      
      setProgress("Uploading poster...");
      const posterUrl = await uploadToCloud(poster, "movies-posters");
      
      setProgress("Uploading movie file (this may take a while)...");
      const videoUrl = await uploadToCloud(movieFile, "movies-videos");
      
      let trailerUrl = "";
      if (trailer) {
        setProgress("Uploading trailer...");
        trailerUrl = await uploadToCloud(trailer, "movies-trailers");
      }

      setProgress("Saving movie details...");
      await api.post("/movies", {
        title,
        description,
        category,
        genres: genres.split(",").map((g) => g.trim()).filter(Boolean),
        thumbnail: posterUrl,
        videoUrl,
        trailerUrl,
        featured: false,
        isPaid,
        price: isPaid ? Number(price || 0) : 0,
      });

      alert("Movie uploaded successfully!");
      navigate("/tv/browse");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed: " + (err.response?.data?.message || err.message));
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="upload-page">
      <button className="back-btn" onClick={() => navigate("/tv/browse")}>
        ← Back to Browse
      </button>
      
      <h1>🎬 Upload a Movie</h1>

      <label>Movie Title *</label>
      <input 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Enter movie title"
        disabled={uploading}
      />

      <label>Description</label>
      <textarea 
        value={description} 
        onChange={(e) => setDescription(e.target.value)} 
        placeholder="Enter movie description"
        rows={4}
        disabled={uploading}
      />

      <label>Category</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={uploading}>
        <option>General</option>
        <option>Movies</option>
        <option>TV Shows</option>
        <option>Documentaries</option>
        <option>Music Videos</option>
        <option>Sports</option>
        <option>Comedy</option>
        <option>Podcasts</option>
        <option>Short Films</option>
        <option>Animation</option>
      </select>

      <label>Genres (comma separated)</label>
      <input
        value={genres}
        onChange={(e) => setGenres(e.target.value)}
        placeholder="Action, Drama, Romance"
        disabled={uploading}
      />

      {/* Pay-Per-View Section */}
      <div className="upload-paywall">
        <label className="paywall-toggle">
          <input
            type="checkbox"
            checked={isPaid}
            onChange={(e) => setIsPaid(e.target.checked)}
            disabled={uploading}
          />
          <span>💳 Make this a Pay-Per-View title</span>
        </label>

        {isPaid && (
          <>
            <label style={{ marginTop: '12px' }}>Ticket Price (USD)</label>
            <input
              type="number"
              min="0"
              step="0.99"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="9.99"
              disabled={uploading}
            />
          </>
        )}
      </div>

      <label>Poster Image * {poster && `✓ ${poster.name}`}</label>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setPoster(e.target.files[0])} 
        disabled={uploading}
      />

      <label>Movie File * {movieFile && `✓ ${movieFile.name}`}</label>
      <input 
        type="file" 
        accept="video/*"
        onChange={(e) => setMovieFile(e.target.files[0])} 
        disabled={uploading}
      />

      <label>Trailer File (optional) {trailer && `✓ ${trailer.name}`}</label>
      <input 
        type="file" 
        accept="video/*"
        onChange={(e) => setTrailer(e.target.files[0])} 
        disabled={uploading}
      />

      {progress && (
        <div className="upload-progress">
          <div className="spinner" />
          <span>{progress}</span>
        </div>
      )}

      <button 
        className="watch-btn upload-submit" 
        onClick={handleSubmit}
        disabled={uploading || !title || !poster || !movieFile}
      >
        {uploading ? "Uploading..." : "🚀 Upload Movie"}
      </button>
    </div>
  );
}

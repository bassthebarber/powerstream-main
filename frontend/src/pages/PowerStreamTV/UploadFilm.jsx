// frontend/src/pages/PowerStreamTV/UploadFilm.jsx
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import "./powerstreamTV.css";

const CATEGORIES = [
  "Movies",
  "TV Shows",
  "Documentaries",
  "Music Videos",
  "Sports",
  "Comedy",
  "Podcasts",
  "Short Films",
  "Animation",
  "Drama",
  "Action",
  "Horror",
  "Sci-Fi",
];

export default function UploadFilm() {
  const navigate = useNavigate();
  const { stationSlug } = useParams();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState("Movies");
  const [genres, setGenres] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState("4.99");
  const [posterFile, setPosterFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [trailerFile, setTrailerFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");

  const uploadToCloud = async (file, folder) => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("station", folder);
    formData.append("title", file.name);

    const res = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 300000,
    });

    return res.data.videoUrl || res.data.url || res.data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !posterFile || !videoFile) {
      setError("Title, poster, and video file are required.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      // Upload poster
      setProgress("Uploading poster...");
      const posterUrl = await uploadToCloud(posterFile, "films-posters");

      // Upload video
      setProgress("Uploading film (this may take a while)...");
      const videoUrl = await uploadToCloud(videoFile, "films-videos");

      // Upload trailer if provided
      let trailerUrl = "";
      if (trailerFile) {
        setProgress("Uploading trailer...");
        trailerUrl = await uploadToCloud(trailerFile, "films-trailers");
      }

      // Create film entry
      setProgress("Saving film details...");
      const filmData = {
        title,
        description,
        tagline,
        category,
        genres: genres.split(",").map(g => g.trim()).filter(Boolean),
        posterUrl,
        thumbnail: posterUrl,
        videoUrl,
        trailerUrl,
        isPaid,
        price: isPaid ? parseFloat(price) : 0,
        stationSlug: stationSlug || "powerstream-tv",
      };

      await api.post("/ps-tv/films", filmData);

      alert("Film uploaded successfully!");
      navigate("/powerstream-tv");
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress("");
    }
  };

  return (
    <div className="ps-tv-upload-page">
      <button className="ps-tv-back" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1>🎬 Upload a Film</h1>
      <p className="ps-tv-upload-subtitle">
        Share your work with the PowerStream TV audience
      </p>

      {error && <div className="ps-tv-error">{error}</div>}

      <form onSubmit={handleSubmit} className="ps-tv-upload-form">
        <div className="ps-tv-form-group">
          <label>Film Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter film title"
            disabled={uploading}
            required
          />
        </div>

        <div className="ps-tv-form-group">
          <label>Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short catchy tagline"
            disabled={uploading}
          />
        </div>

        <div className="ps-tv-form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your film..."
            rows={4}
            disabled={uploading}
          />
        </div>

        <div className="ps-tv-form-row">
          <div className="ps-tv-form-group">
            <label>Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={uploading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="ps-tv-form-group">
            <label>Genres (comma separated)</label>
            <input
              type="text"
              value={genres}
              onChange={(e) => setGenres(e.target.value)}
              placeholder="Action, Drama, Thriller"
              disabled={uploading}
            />
          </div>
        </div>

        <div className="ps-tv-ppv-toggle">
          <label>
            <input
              type="checkbox"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              disabled={uploading}
            />
            <span>💳 Make this Pay-Per-View</span>
          </label>
          {isPaid && (
            <div className="ps-tv-price-input">
              <label>Price (USD)</label>
              <input
                type="number"
                min="0.99"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={uploading}
              />
            </div>
          )}
        </div>

        <div className="ps-tv-form-group">
          <label>Poster Image * {posterFile && `✓ ${posterFile.name}`}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPosterFile(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        <div className="ps-tv-form-group">
          <label>Film Video * {videoFile && `✓ ${videoFile.name}`}</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setVideoFile(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        <div className="ps-tv-form-group">
          <label>Trailer (optional) {trailerFile && `✓ ${trailerFile.name}`}</label>
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setTrailerFile(e.target.files[0])}
            disabled={uploading}
          />
        </div>

        {progress && (
          <div className="ps-tv-progress">
            <div className="ps-tv-spinner" />
            <span>{progress}</span>
          </div>
        )}

        <button
          type="submit"
          className="ps-tv-cta-button"
          disabled={uploading || !title || !posterFile || !videoFile}
        >
          {uploading ? "Uploading..." : "🚀 Upload Film"}
        </button>
      </form>
    </div>
  );
}




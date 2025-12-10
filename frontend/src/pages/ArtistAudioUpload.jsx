import { useState } from 'react';
import api from '../lib/api';
import './ArtistAudioUpload.css';

const DEFAULT_STATION = 'no-limit-east-houston';

const ArtistAudioUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [creatingTrack, setCreatingTrack] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [form, setForm] = useState({
    stationKey: DEFAULT_STATION,
    title: '',
    artistName: '',
    albumName: '',
    genre: '',
    releaseDate: '',
    isExplicit: false,
    coverArtUrl: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!file) {
      setError('Please select an audio file.');
      return;
    }

    if (!form.title || !form.artistName) {
      setError('Title and artist name are required.');
      return;
    }

    try {
      // 1) Upload file to Cloudinary via existing backend audio upload route
      setUploadingFile(true);
      const data = new FormData();
      data.append('file', file);

      const uploadRes = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (!uploadRes.data?.url && !uploadRes.data?.data?.url) {
        throw new Error(uploadRes.data?.message || 'Upload failed');
      }

      const audioUrl = uploadRes.data.url || uploadRes.data.data?.url;
      const duration = uploadRes.data.duration || uploadRes.data.data?.duration || 0;

      setUploadingFile(false);

      // 2) Create AudioTrack via /api/audio-tracks
      setCreatingTrack(true);
      const createRes = await api.post('/audio-tracks', {
        stationKey: form.stationKey,
        title: form.title,
        artistName: form.artistName,
        albumName: form.albumName || undefined,
        genre: form.genre || undefined,
        releaseDate: form.releaseDate || undefined,
        isExplicit: form.isExplicit,
        coverArtUrl: form.coverArtUrl || undefined,
        audioUrl,
        duration
      });

      if (!createRes.data?.success) {
        throw new Error(createRes.data?.message || 'Failed to create track');
      }

      setCreatingTrack(false);
      setSuccessMessage('Track uploaded and published to station!');
      setFile(null);
      setForm((prev) => ({
        ...prev,
        title: '',
        albumName: '',
        genre: '',
        releaseDate: '',
        isExplicit: false,
        coverArtUrl: ''
      }));
    } catch (err) {
      console.error(err);
      setUploadingFile(false);
      setCreatingTrack(false);
      setError(err.message || 'Something went wrong while uploading the track.');
    }
  };

  return (
    <div className="artist-upload-page">
      <header className="artist-upload-header">
        <h1>Upload Your Music</h1>
        <p>
          Submit finished songs directly to PowerStream, just like Spotify. Your tracks
          will appear on the selected station&apos;s audio page.
        </p>
      </header>

      <form className="artist-upload-form" onSubmit={handleSubmit}>
        <section className="artist-upload-section">
          <h2>Audio File</h2>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
          />
          {file && (
            <div className="file-name">
              Selected: <strong>{file.name}</strong>
            </div>
          )}
        </section>

        <section className="artist-upload-section">
          <h2>Track Details</h2>

          <label>
            Station
            <select
              name="stationKey"
              value={form.stationKey}
              onChange={handleChange}
            >
              <option value="no-limit-east-houston">No Limit East Houston</option>
              <option value="southern-power-network">Southern Power Network</option>
              <option value="civic-connect">Civic Connect</option>
            </select>
          </label>

          <label>
            Track Title *
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Artist Name *
            <input
              type="text"
              name="artistName"
              value={form.artistName}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Album / Project
            <input
              type="text"
              name="albumName"
              value={form.albumName}
              onChange={handleChange}
            />
          </label>

          <label>
            Genre
            <input
              type="text"
              name="genre"
              value={form.genre}
              onChange={handleChange}
              placeholder="Rap, R&B, Gospel, etc."
            />
          </label>

          <label>
            Release Date
            <input
              type="date"
              name="releaseDate"
              value={form.releaseDate}
              onChange={handleChange}
            />
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isExplicit"
              checked={form.isExplicit}
              onChange={handleChange}
            />
            Explicit content
          </label>

          <label>
            Cover Art URL (optional)
            <input
              type="text"
              name="coverArtUrl"
              value={form.coverArtUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </label>
        </section>

        {error && <div className="artist-upload-error">{error}</div>}
        {successMessage && (
          <div className="artist-upload-success">{successMessage}</div>
        )}

        <button
          type="submit"
          className="artist-upload-button"
          disabled={uploadingFile || creatingTrack}
        >
          {uploadingFile
            ? 'Uploading audio...'
            : creatingTrack
            ? 'Creating track...'
            : 'Upload Track'}
        </button>
      </form>
    </div>
  );
};

export default ArtistAudioUpload;



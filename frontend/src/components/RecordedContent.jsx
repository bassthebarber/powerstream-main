import React, { useEffect, useState } from "react";
import { fetchVODAssets } from "../lib/streamApi.js";

export default function RecordedContent({ stationId }) {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!stationId) {
      setAssets([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await fetchVODAssets(stationId, 20);
        if (cancelled) return;
        const list = Array.isArray(data?.assets)
          ? data.assets
          : Array.isArray(data)
          ? data
          : [];
        setAssets(list);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load recordings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [stationId]);

  if (!stationId) return null;

  if (loading) {
    return (
      <div className="recorded-content-grid" style={{ marginBottom: "16px" }}>
        <p className="no-content-message" style={{ opacity: 0.7 }}>
          Loading replays...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="recorded-content-grid" style={{ marginBottom: "16px" }}>
        <p className="no-content-message" style={{ color: "#f87171" }}>
          {error}
        </p>
      </div>
    );
  }

  if (!assets.length) {
    return (
      <div className="recorded-content-grid" style={{ marginBottom: "16px" }}>
        <p className="no-content-message">
          No recorded shows for this station yet.
        </p>
      </div>
    );
  }

  return (
    <div className="recorded-content-grid" style={{ marginBottom: "24px" }}>
      {assets.map((asset) => (
        <div key={asset.id} className="recorded-content-card">
          {asset.thumbnailUrl && (
            <img
              src={asset.thumbnailUrl}
              alt={asset.title}
              className="recorded-content-poster"
            />
          )}
          <div className="recorded-content-info">
            <div className="recorded-content-title">{asset.title}</div>
            {asset.description && (
              <div className="recorded-content-description">
                {asset.description}
              </div>
            )}
            <div className="recorded-content-meta">
              {asset.recordedAt &&
                new Date(asset.recordedAt).toLocaleDateString()}
              {asset.duration &&
                ` • ${Math.floor(asset.duration / 60)}:${String(
                  asset.duration % 60
                ).padStart(2, "0")}`}
            </div>
            {asset.videoUrl && (
              <video
                controls
                src={asset.videoUrl}
                style={{ width: "100%", marginTop: "8px", borderRadius: "8px" }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

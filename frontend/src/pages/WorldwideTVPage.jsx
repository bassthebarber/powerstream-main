import React from "react";
import { Link } from "react-router-dom";

export default function WorldwideTVPage() {
  return (
    <div className="ps-page">
      <h1>Worldwide TV</h1>
      <p className="ps-subtitle">
        Global streams and partner channels coming to the PowerStream network.
      </p>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        This is a shell page restored so existing navigation does not break.
        You can expand it later with curated worldwide channels and schedules.
      </p>
      <Link to="/stations" className="ps-back">
        ← Back to TV Stations Hub
      </Link>
    </div>
  );
}

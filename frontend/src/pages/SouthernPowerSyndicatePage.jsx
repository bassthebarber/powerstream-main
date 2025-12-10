import React from "react";
import { Link } from "react-router-dom";

export default function SouthernPowerSyndicatePage() {
  return (
    <div className="ps-page">
      <h1>Southern Power Syndicate</h1>
      <p className="ps-subtitle">
        Flagship network featuring No Limit East Houston, Texas Got Talent, and
        Civic Connect.
      </p>
      <p style={{ color: "var(--muted)", maxWidth: 640 }}>
        This page can host long-form descriptions, featured shows, and direct
        links into the TV Stations hub and live channels.
      </p>
      <Link to="/stations" className="ps-back">
        ← Back to TV Stations Hub
      </Link>
    </div>
  );
}

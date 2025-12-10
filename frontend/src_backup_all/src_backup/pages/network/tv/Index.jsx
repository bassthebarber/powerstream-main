import React from 'react';
import { Link } from 'react-router-dom';
import './TVLanding.css'; // Optional: add this CSS if needed

export default function TVLandingPage() {
  return (
    <div className="tv-landing">
      <h1>Southern Power Network TV</h1>
      <ul>
        <li><Link to="/tv/nolimit">No Limit East Houston TV</Link></li>
        <li><Link to="/tv/texasgottalent">Texas Got Talent TV</Link></li>
        <li><Link to="/tv/civicconnect">Civic Connect TV</Link></li>
        <li><Link to="/tv/southernpower">Southern Power Network</Link></li>
      </ul>
    </div>
  );
}



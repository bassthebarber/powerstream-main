// frontend/src/components/StationList.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function StationList() {
  const [stations, setStations] = useState([]);

  useEffect(() => {
    fetch('/api/stations')
      .then(res => res.json())
      .then(data => setStations(data))
      .catch(err => console.error('Error fetching stations:', err));
  }, []);

  return (
    <div className="station-list">
      <h2>Available Stations</h2>
      <ul>
        {stations.map(station => (
          <li key={station._id}>
            <Link to={`/stations/${station._id}`}>
              {station.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

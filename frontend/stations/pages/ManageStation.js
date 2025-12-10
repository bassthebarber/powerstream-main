// frontend/src/pages/stations/ManageStation.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ManageStation() {
  const { stationId } = useParams();
  const [station, setStation] = useState(null);

  useEffect(() => {
    fetch(`/api/stations/${stationId}`)
      .then(res => res.json())
      .then(data => setStation(data))
      .catch(err => console.error('Manage station load error:', err));
  }, [stationId]);

  const updateStation = () => {
    fetch(`/api/stations/${stationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(station)
    })
      .then(() => alert('Station updated successfully!'))
      .catch(err => console.error('Update error:', err));
  };

  if (!station) return <div>Loading station...</div>;

  return (
    <div className="manage-station">
      <h2>Manage Station</h2>
      <input
        type="text"
        value={station.name}
        onChange={e => setStation({ ...station, name: e.target.value })}
      />
      <input
        type="text"
        value={station.streamUrl}
        onChange={e => setStation({ ...station, streamUrl: e.target.value })}
      />
      <button onClick={updateStation}>Save Changes</button>
    </div>
  );
}

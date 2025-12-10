import React from 'react';

const TVStationData = () => {
  const stations = [
    { name: "Southern Power", time: "6:00 PM", desc: "Community spotlight and music" },
    { name: "No Limit East Houston", time: "8:00 PM", desc: "Hip-Hop shows and battles" },
    { name: "Civic Connect", time: "7:00 PM", desc: "Local civic events and coverage" },
  ];

  return (
    <div className="tv-station-data">
      <h2>📺 Station Data</h2>
      <ul>
        {stations.map((s, idx) => (
          <li key={idx}>
            <strong>{s.name}</strong> — {s.time}  
            <div>{s.desc}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TVStationData;



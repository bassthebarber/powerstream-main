import React from 'react';

export default function CreatorStats({ data }) {
  return (
    <div>
      <h3>Creator Stats</h3>
      {Object.entries(data).map(([creator, stats]) => (
        <div key={creator}>
          <strong>{creator}</strong>
          <p>Streams: {stats.streams}</p>
          <p>Tips: ${stats.tips}</p>
          <p>Revenue: ${stats.revenue}</p>
        </div>
      ))}
    </div>
  );
}

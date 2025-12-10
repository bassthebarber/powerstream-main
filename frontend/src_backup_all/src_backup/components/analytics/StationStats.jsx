import React from 'react';

export default function StationStats({ stats }) {
  return (
    <div>
      <h3>Station Stats</h3>
      <ul>
        {Object.entries(stats).map(([station, views]) => (
          <li key={station}>{station}: {views} views</li>
        ))}
      </ul>
    </div>
  );
}

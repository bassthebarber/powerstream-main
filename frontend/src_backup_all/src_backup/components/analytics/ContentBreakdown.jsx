import React from 'react';

export default function ContentBreakdown({ stats }) {
  return (
    <div>
      <h3>Track Plays</h3>
      <ul>
        {Object.entries(stats).map(([track, count]) => (
          <li key={track}>{track}: {count} plays</li>
        ))}
      </ul>
    </div>
  );
}

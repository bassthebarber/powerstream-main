// frontend/src/components/StationSchedule.js
import React from 'react';

export default function StationSchedule({ schedule }) {
  if (!schedule || schedule.length === 0) return <p>No scheduled programs.</p>;

  return (
    <div className="station-schedule">
      <h3>Upcoming Shows</h3>
      <ul>
        {schedule.map((item, idx) => (
          <li key={idx}>
            <strong>{item.time}</strong> - {item.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

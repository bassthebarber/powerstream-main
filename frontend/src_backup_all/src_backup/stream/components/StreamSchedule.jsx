// frontend/components/stream/StreamSchedule.js
import React from 'react';

export default function StreamSchedule({ schedule = [] }) {
  return (
    <div className="stream-schedule">
      <h4>📅 Upcoming Streams</h4>
      <ul>
        {schedule.length > 0 ? (
          schedule.map((item, idx) => (
            <li key={idx}>
              <strong>{item.title}</strong> - {item.date} at {item.time}
            </li>
          ))
        ) : (
          <li>No scheduled streams.</li>
        )}
      </ul>
    </div>
  );
}



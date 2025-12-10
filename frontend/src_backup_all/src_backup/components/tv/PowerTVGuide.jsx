import React, { useEffect, useState } from 'react';

export default function PowerTVGuide() {
  const [schedule, setSchedule] = useState([]);

  useEffect(() => {
    fetch('/api/tv/schedule')
      .then((res) => res.json())
      .then((data) => setSchedule(data))
      .catch((err) => console.error('Schedule fetch error:', err));
  }, []);

  return (
    <div className="power-tv-guide">
      <h2>🗓️ PowerTV Program Guide</h2>
      <ul>
        {schedule.map((show, index) => (
          <li key={index}>
            <strong>{show.time}</strong> — {show.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

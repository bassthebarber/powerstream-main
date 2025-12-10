// frontend/pages/stream/ScheduleStream.js
import React, { useState } from 'react';

export default function ScheduleStream() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [schedule, setSchedule] = useState([]);

  const handleSchedule = () => {
    if (!title || !date || !time) return;
    setSchedule([...schedule, { title, date, time }]);
    setTitle('');
    setDate('');
    setTime('');
  };

  return (
    <div className="schedule-stream">
      <h2>📅 Schedule a Stream</h2>
      <input
        type="text"
        placeholder="Stream title..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button onClick={handleSchedule}>Add to Schedule</button>

      <ul>
        {schedule.map((item, idx) => (
          <li key={idx}>
            <strong>{item.title}</strong> — {item.date} at {item.time}
          </li>
        ))}
      </ul>
    </div>
  );
}



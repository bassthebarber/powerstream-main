// frontend/pages/stream/MyStream.js
import React, { useState } from 'react';
import StreamPlayer from '../../components/stream/StreamPlayer';
import StreamSchedule from '../../components/stream/StreamSchedule';

export default function MyStream() {
  const [schedule] = useState([
    { title: 'Music Showcase', date: 'Aug 5', time: '8:00 PM' },
    { title: 'Behind the Scenes', date: 'Aug 6', time: '7:00 PM' },
  ]);

  return (
    <div className="my-stream">
      <h2>📺 My Stream Dashboard</h2>
      <StreamPlayer streamUrl="https://your-stream-server/live/my-stream" />
      <StreamSchedule schedule={schedule} />
    </div>
  );
}



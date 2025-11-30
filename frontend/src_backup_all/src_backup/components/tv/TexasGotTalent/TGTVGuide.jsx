import React from 'react';

const TGTVGuide = () => {
  const shows = [
    { time: '6:00 PM', title: 'Live Auditions' },
    { time: '7:30 PM', title: 'Judge Feedback' },
    { time: '9:00 PM', title: 'Results & Highlights' },
  ];

  return (
    <div className="tgt-tv-guide">
      <h3>📺 Show Schedule</h3>
      <ul>
        {shows.map((show, idx) => (
          <li key={idx}>
            <strong>{show.time}</strong> — {show.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TGTVGuide;

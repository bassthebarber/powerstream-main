import React from 'react';

const NoLimitTVGuide = () => {
  const shows = [
    { time: '7:00 PM', title: 'Freestyle Friday Cyphers' },
    { time: '8:30 PM', title: 'Exclusive Interview: H-Town Legends' },
    { time: '10:00 PM', title: 'Unsigned Artist Spotlight' },
  ];

  return (
    <div className="tv-guide-section">
      <h3>📺 No Limit TV Guide</h3>
      <ul>
        {shows.map((show, i) => (
          <li key={i}>
            <strong>{show.time}</strong>: {show.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NoLimitTVGuide;

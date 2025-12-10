import React, { useEffect, useState } from 'react';
import AudioPlayer from './AudioPlayer';

const AudioFeed = () => {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    // Replace with real fetch logic from Supabase or your DB
    setTracks([
      { id: 1, title: 'Track 1', url: '/audio/track1.mp3' },
      { id: 2, title: 'Track 2', url: '/audio/track2.mp3' },
    ]);
  }, []);

  return (
    <div>
      <h3>Latest Uploads</h3>
      {tracks.map((track) => (
        <AudioPlayer key={track.id} title={track.title} src={track.url} />
      ))}
    </div>
  );
};

export default AudioFeed;



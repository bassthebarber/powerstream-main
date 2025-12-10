// pages/audio/[trackId].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AudioPlayer from '../../components/AudioPlayer';

const TrackPage = () => {
  const router = useRouter();
  const { trackId } = router.query;
  const [track, setTrack] = useState(null);

  useEffect(() => {
    if (trackId) {
      fetch(`/api/audio/${trackId}`)
        .then((res) => res.json())
        .then((data) => setTrack(data))
        .catch((err) => console.error('Failed to load track', err));
    }
  }, [trackId]);

  if (!track) return <p>Loading...</p>;

  return (
    <div style={{ backgroundColor: 'black', color: 'gold', padding: '20px' }}>
      <h1>{track.title}</h1>
      <p>Artist: {track.artist}</p>
      <AudioPlayer src={track.url} />
    </div>
  );
};

export default TrackPage;

// pages/video/[videoId].js
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import StreamPlayer from '../../components/StreamPlayer';

const VideoPage = () => {
  const router = useRouter();
  const { videoId } = router.query;
  const [video, setVideo] = useState(null);

  useEffect(() => {
    if (videoId) {
      fetch(`/api/video/${videoId}`)
        .then((res) => res.json())
        .then((data) => setVideo(data))
        .catch((err) => console.error('Failed to load video', err));
    }
  }, [videoId]);

  if (!video) return <p>Loading...</p>;

  return (
    <div style={{ backgroundColor: '#000', color: '#FFD700', padding: '20px' }}>
      <h1>{video.title}</h1>
      <p>By: {video.creator}</p>
      <StreamPlayer src={video.url} />
    </div>
  );
};

export default VideoPage;

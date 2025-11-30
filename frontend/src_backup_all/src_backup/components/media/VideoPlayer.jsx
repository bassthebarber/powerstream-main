import React from 'react';

const VideoPlayer = ({ src }) => (
  <video width="100%" height="auto" controls>
    <source src={src} type="video/mp4" />
    Your browser does not support the video tag.
  </video>
);

export default VideoPlayer;



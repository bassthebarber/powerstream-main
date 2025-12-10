import React from 'react';

const AutoReelGallery = ({ reels }) => (
  <div className="reel-gallery">
    {reels.map((reel, i) => (
      <video key={i} src={reel.url} controls autoPlay loop />
    ))}
  </div>
);

export default AutoReelGallery;



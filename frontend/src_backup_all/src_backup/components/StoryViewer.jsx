// src/components/StoryViewer.jsx
import React from 'react';

const StoryViewer = ({ story, onClose }) => {
  if (!story) return null;

  return (
    <div className="story-viewer-overlay" onClick={onClose}>
      <div className="story-viewer">
        <img src={story.image} alt={story.name} />
        <h2>{story.name}'s Story</h2>
      </div>
    </div>
  );
};

export default StoryViewer;



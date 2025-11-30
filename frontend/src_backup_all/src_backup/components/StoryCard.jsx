// src/components/StoryCard.jsx
import React from 'react';

const StoryCard = ({ story }) => {
  const handleClick = () => {
    // Placeholder logic for story viewer
    alert(`Open story: ${story.name}`);
  };

  return (
    <div className="story-card" onClick={handleClick}>
      <img src={story.image} alt={story.name} className="story-avatar" />
      <span className="story-name">{story.name}</span>
      {story.isUser && <div className="add-icon">+</div>}
    </div>
  );
};

export default StoryCard;



// src/components/StoryBarPro.jsx
import React from 'react';
import StoryCard from './StoryCard';
import './Story.module.css';

const storyData = [
  { id: 1, name: 'You', image: '/logos/powerstream-logo.png', isUser: true },
  { id: 2, name: 'Ayana', image: '/logos/powergram-logo.png' },
  { id: 3, name: 'Jairmy', image: '/logos/nolimit-easthouston-logo.png' },
  { id: 4, name: 'Brooklyn', image: '/logos/civicconnect-logo.png' },
];

const StoryBarPro = () => {
  return (
    <div className="story-bar">
      {storyData.map((story) => (
        <StoryCard key={story.id} story={story} />
      ))}
    </div>
  );
};

export default StoryBarPro;



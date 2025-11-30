// frontend/src/components/StoryBoard.jsx
import React from 'react';
import './StoryBoard.css';

export default function StoryBoard() {
  const stories = ['Ayana', 'Mike', 'Felicia', 'Brooklyn'];

  return (
    <div className="story-board">
      {stories.map((name, i) => (
        <div className="story" key={i}>
          <div className="avatar">{name[0]}</div>
          <span>{name}</span>
        </div>
      ))}
    </div>
  );
}



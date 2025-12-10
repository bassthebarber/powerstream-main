import React from 'react';

const BeCreativeStory = ({ story }) => (
  <div className="creative-story">
    <h4>{story.title}</h4>
    <p>{story.content}</p>
  </div>
);

export default BeCreativeStory;



import React from "react";

const StoryChatTrigger = ({ story, onStartChat }) => {
  return (
    <div className="story-chat-trigger" onClick={() => onStartChat(story.user)}>
      <img src={story.thumbnail} alt="story" />
      <p>{story.user.name}</p>
    </div>
  );
};

export default StoryChatTrigger;



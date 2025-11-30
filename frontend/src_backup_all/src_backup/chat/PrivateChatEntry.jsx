import React from "react";

const PrivateChatEntry = ({ friend, onStart }) => (
  <div className="private-chat-entry" onClick={() => onStart(friend)}>
    {friend.name}
  </div>
);

export default PrivateChatEntry;



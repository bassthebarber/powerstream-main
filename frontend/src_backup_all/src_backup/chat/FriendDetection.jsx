import React from "react";

const FriendDetection = ({ userList }) => {
  return (
    <div className="friend-detection">
      <h4>Friends Online:</h4>
      {userList.map((user, idx) => (
        <div key={idx}>{user.name}</div>
      ))}
    </div>
  );
};

export default FriendDetection;



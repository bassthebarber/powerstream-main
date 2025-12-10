import React from 'react';

const CallCard = ({ caller, onAccept, onReject }) => {
  return (
    <div className="call-card">
      <p>{caller.name} is calling...</p>
      <button onClick={onAccept}>Accept</button>
      <button onClick={onReject}>Reject</button>
    </div>
  );
};

export default CallCard;

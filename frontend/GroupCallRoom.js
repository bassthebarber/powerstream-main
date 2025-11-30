import React, { useEffect, useRef } from 'react';

const GroupCallRoom = ({ streams }) => {
  return (
    <div className="group-call-room">
      {streams.map((stream, index) => (
        <video key={index} ref={ref => ref && (ref.srcObject = stream)} autoPlay />
      ))}
    </div>
  );
};

export default GroupCallRoom;

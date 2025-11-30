// frontend/stream/index.jsx
import React from 'react';
import '../styles/stream.css';
import '../styles/streamOverlays.css';
import StreamPlayer from './StreamPlayer';
import StreamChat from './StreamChat';
import StreamControls from './StreamControls';

export default function StreamIndex({ streamId }) {
  return (
    <div className="stream-container">
      <div className="stream-header">Live Stream</div>
      <div className="stream-video">
        <StreamPlayer streamId={streamId} />
      </div>
      <StreamControls streamId={streamId} />
      <StreamChat streamId={streamId} />
    </div>
  );
}



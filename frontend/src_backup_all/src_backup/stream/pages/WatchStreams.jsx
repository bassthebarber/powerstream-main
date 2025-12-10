// frontend/pages/stream/WatchStream.js
import React, { useState } from 'react';
import StreamPlayer from '../../components/stream/StreamPlayer';
import StreamChat from '../../components/stream/StreamChat';
import StreamOverlay from '../../components/stream/StreamOverlay';

export default function WatchStream() {
  const [messages, setMessages] = useState([]);
  const streamUrl = 'https://your-stream-server/live/stream-key';

  const handleSendMessage = (msg) => {
    setMessages([...messages, { text: msg, sender: 'Viewer' }]);
  };

  return (
    <div className="watch-stream">
      <StreamPlayer streamUrl={streamUrl} />
      <StreamOverlay
        logo="/logo.png"
        stats={{ viewers: 54, likes: 321 }}
      />
      <StreamChat onSend={handleSendMessage} />
    </div>
  );
}



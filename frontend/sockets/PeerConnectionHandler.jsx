// frontend/src/sockets/PeerConnectionHandler.jsx
import { useEffect } from 'react';

const PeerConnectionHandler = () => {
  useEffect(() => {
    console.log("🔌 Peer connection handler initialized.");
  }, []);

  return (
    <div>
      <p>Connecting to peers...</p>
    </div>
  );
};

export default PeerConnectionHandler;

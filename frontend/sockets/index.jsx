// frontend/src/sockets/index.jsx
import PeerConnectionHandler from './PeerConnectionHandler';

const SocketIndex = () => {
  return (
    <div style={{ color: '#FFD700', padding: '20px' }}>
      <h2>📡 Socket Interface Online</h2>
      <PeerConnectionHandler />
    </div>
  );
};

export default SocketIndex;

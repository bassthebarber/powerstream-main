import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const BottomTabs = () => {
  const location = useLocation();
  const showTabs = ['/feed', '/gram', '/reel'].includes(location.pathname);

  if (!showTabs) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      width: '100%',
      display: 'flex',
      justifyContent: 'space-around',
      background: '#000',
      padding: '0.75rem 0',
      borderTop: '2px solid gold',
    }}>
      <Link to="/feed" style={{ color: 'white', fontWeight: 'bold' }}>Feed</Link>
      <Link to="/gram" style={{ color: 'white', fontWeight: 'bold' }}>Gram</Link>
      <Link to="/reel" style={{ color: 'white', fontWeight: 'bold' }}>Reels</Link>
    </div>
  );
};

export default BottomTabs;



// pages/404.js
import React from 'react';

export default function Custom404() {
  return (
    <div style={{ backgroundColor: '#000', color: '#FFD700', textAlign: 'center', paddingTop: '100px' }}>
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist on PowerStream.</p>
      <a href="/" style={{ color: '#FFD700', textDecoration: 'underline' }}>Go Back Home</a>
    </div>
  );
}

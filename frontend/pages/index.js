// pages/index.js
import React, { useEffect } from 'react';
import Head from 'next/head';

export default function HomePage() {
  useEffect(() => {
    const audio = new Audio('/audio/welcome.mp3');
    audio.play().catch(() => {});
  }, []);

  return (
    <div style={{ backgroundColor: '#fff', height: '100vh', textAlign: 'center' }}>
      <Head>
        <title>PowerStream</title>
      </Head>
      <img src="/powerstream-logo.png" alt="PowerStream Logo" style={{ width: '300px', marginTop: '60px', animation: 'spin 2s linear infinite' }} />
      <h1 style={{ color: '#000', marginTop: '20px' }}>Welcome to PowerStream</h1>
      <p style={{ color: '#666' }}>Explore Audio, Video, TV, and Live Streaming</p>
      <div style={{ marginTop: '30px' }}>
        <a href="/audio" style={navStyle}>Audio</a>
        <a href="/video" style={navStyle}>Video</a>
        <a href="/stream" style={navStyle}>Live Stream</a>
        <a href="/feed" style={navStyle}>PowerFeed</a>
        <a href="/chat" style={navStyle}>PowerLine</a>
        <a href="/tvguide" style={navStyle}>TV Guide</a>
      </div>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

const navStyle = {
  margin: '0 15px',
  color: '#000',
  fontWeight: 'bold',
  textDecoration: 'none',
  fontSize: '18px'
};

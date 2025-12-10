// pages/video/index.js
import React from 'react';
import VideoFeed from '../../components/VideoFeed';
import styles from '../../styles/VideoPage.module.css';

const VideoPage = () => {
  return (
    <div className={styles.container}>
      <img src="/powerstream-logo.png" alt="PowerStream Logo" className={styles.logo} />
      <h1 className={styles.title}>PowerStream Video</h1>
      <p className={styles.subtitle}>Stream films, performances, and creative content</p>
      <a href="/video/upload" className={styles.uploadButton}>Upload Video</a>
      <VideoFeed />
    </div>
  );
};

export default VideoPage;

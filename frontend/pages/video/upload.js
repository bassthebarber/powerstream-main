// pages/video/upload.js
import React from 'react';
import VideoUploadForm from '../../components/VideoUploadForm';
import styles from '../../styles/VideoPage.module.css';

const VideoUploadPage = () => {
  return (
    <div className={styles.container}>
      <img src="/powerstream-logo.png" alt="PowerStream Logo" className={styles.logo} />
      <h1 className={styles.title}>Upload Your Video</h1>
      <p className={styles.subtitle}>Share your visual content with the PowerStream community</p>
      <VideoUploadForm />
    </div>
  );
};

export default VideoUploadPage;

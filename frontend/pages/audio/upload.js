// pages/audio/upload.js
import React from 'react';
import AudioUploadForm from '../../components/AudioUploadForm';
import styles from '../../styles/AudioPage.module.css';

const AudioUploadPage = () => {
  return (
    <div className={styles.container}>
      <img src="/powerstream-logo.png" alt="PowerStream Logo" className={styles.logo} />
      <h1 className={styles.title}>Upload Your Audio</h1>
      <p className={styles.subtitle}>Share your music, podcasts, or drops with the world</p>
      <AudioUploadForm />
    </div>
  );
};

export default AudioUploadPage;

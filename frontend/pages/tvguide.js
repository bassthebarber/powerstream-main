// pages/tvguide.js
import React from 'react';
import TVGuide from '../components/TVGuide';
import styles from '../styles/TVGuide.module.css';

const TVGuidePage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>PowerStream TV Guide</h1>
      <p className={styles.subtitle}>Explore all active stations and broadcasts</p>
      <TVGuide />
    </div>
  );
};

export default TVGuidePage;

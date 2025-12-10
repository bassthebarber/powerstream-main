import React from "react";
import styles from "../../styles/PowerFeed.module.css";
import CreatePost from "../../components/feed/CreatePost.jsx";
import FeedTimeline from "../../components/feed/FeedTimeline.jsx";

export default function FeedPage() {
  return (
    <div className={styles.shell}>
      {/* Left sidebar (placeholders you can swap for your widgets) */}
      <aside className={styles.left}>
        <div className={styles.card}>
          <h3>Shortcuts</h3>
          <ul className={styles.list}>
            <li>My Profile</li>
            <li>Groups</li>
            <li>Saved</li>
          </ul>
        </div>
        <div className={styles.card}>
          <h3>Friends online</h3>
          <p>Coming soon</p>
        </div>
      </aside>

      {/* Main column */}
      <main className={styles.center}>
        {/* “Stories” row – simple placeholder for now */}
        <div className={styles.stories}>
          <div className={styles.story}>Story 1</div>
          <div className={styles.story}>Story 2</div>
          <div className={styles.story}>Story 3</div>
        </div>

        {/* Create post */}
        <CreatePost />

        {/* Timeline */}
        <FeedTimeline />
      </main>

      {/* Right sidebar */}
      <aside className={styles.right}>
        <div className={styles.card}>
          <h3>Pages</h3>
          <p>PowerStream • PowerGram • PowerReel</p>
        </div>
        <div className={styles.card}>
          <h3>Sponsored</h3>
          <p>Ad spot</p>
        </div>
      </aside>
    </div>
  );
}



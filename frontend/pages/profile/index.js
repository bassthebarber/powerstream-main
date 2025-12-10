import React from "react";
import Link from "next/link";
import styles from "./index.module.css";

export default function ProfileIndex() {
  return (
    <div className={styles.container}>
      <h1>Funny & Paige's Profile</h1>
      <nav className={styles.nav}>
        <Link href="/profile/feed">Feed</Link>
        <Link href="/profile/stream">Stream</Link>
        <Link href="/profile/tvguide">TV Guide</Link>
      </nav>
    </div>
  );
}

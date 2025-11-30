import React from "react";
import { Link } from "react-router-dom";
import styles from "./Header.module.css"; // adjust if your CSS file is named differently

export default function Header() {
  return (
    <header className={styles.bar}>
      <Link to="/home" className={styles.brand}>PowerStream</Link>
      {/* Add navigation items below */}
      <nav>
        <Link to="/feed">Feed</Link>
        <Link to="/gram">Gram</Link>
        <Link to="/reel">Reel</Link>
        <Link to="/network">Network</Link>
      </nav>
    </header>
  );
}



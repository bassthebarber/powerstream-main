import React from "react";
import { Link } from "react-router-dom";
import styles from "../styles/NavBar.module.css";

export default function NavBar() {
  return (
    <nav className={styles.nav}>
      <Link to="/feed" className={styles.link}>
        <img src="/logos/powerfeedlogo.png" alt="Feed" className={styles.icon} />
      </Link>
      <Link to="/gram" className={styles.link}>
        <img src="/logos/powergram-logo.png" alt="Gram" className={styles.icon} />
      </Link>
      <Link to="/reel" className={styles.link}>
        <img src="/logos/powerreels-logo.png" alt="Reel" className={styles.icon} />
      </Link>
      <Link to="/powerline" className={styles.link}>
        <img src="/logos/powerline-logo.png" alt="Line" className={styles.icon} />
      </Link>
    </nav>
  );
}



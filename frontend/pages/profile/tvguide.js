import React, { useEffect, useState } from "react";
import styles from "./tvguide.module.css";

export default function ProfileTVGuide() {
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    fetch("/api/tvguide")
      .then(res => res.json())
      .then(data => setPrograms(data || []))
      .catch(err => console.error("❌ Failed to load TV guide:", err));
  }, []);

  return (
    <div className={styles.container}>
      <h2>📺 TV Guide</h2>
      {programs.length === 0 && <p>No upcoming programs.</p>}
      <ul>
        {programs.map((prog, i) => (
          <li key={i}>
            <strong>{prog.time}</strong> - {prog.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

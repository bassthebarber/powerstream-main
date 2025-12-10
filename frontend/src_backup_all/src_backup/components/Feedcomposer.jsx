import React, { useState } from "react";
import styles from "./FeedComposer.module.css";

export default function FeedComposer({ onPosted }) {
  const [text, setText] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    onPosted?.({ id: crypto.randomUUID(), text, created_at: new Date().toISOString() });
    setText("");
  }

  return (
    <form className={styles.box} onSubmit={handleSubmit}>
      <textarea
        placeholder="What's going on in your world?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className={styles.actions}>
        <button type="submit">Post</button>
      </div>
    </form>
  );
}



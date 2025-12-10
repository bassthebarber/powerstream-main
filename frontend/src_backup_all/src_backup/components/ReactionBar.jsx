import React, { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import styles from "./ReactionBar.module.css";

const emojis = ["👍", "❤️", "😮"];

const ReactionBar = ({ postId }) => {
  const [reactions, setReactions] = useState({});

  useEffect(() => {
    fetchReactions();
  }, []);

  const fetchReactions = async () => {
    const { data, error } = await supabase
      .from("post_reactions")
      .select("emoji, count");

    if (!error && data) {
      const counts = {};
      data.forEach(({ emoji, count }) => {
        counts[emoji] = count;
      });
      setReactions(counts);
    }
  };

  const handleReact = async (emoji) => {
    const { error } = await supabase
      .from("post_reactions")
      .insert([{ post_id: postId, emoji }]);

    if (!error) fetchReactions();
  };

  return (
    <div className={styles.reactionBar}>
      {emojis.map((emoji) => (
        <button key={emoji} onClick={() => handleReact(emoji)}>
          {emoji} {reactions[emoji] || 0}
        </button>
      ))}
    </div>
  );
};

export default ReactionBar;



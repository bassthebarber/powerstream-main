// src/components/feed/CommentsThread.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { addComment } from "../../services/feedApi";
import css from "./CommentsThread.module.css";

export default function CommentsThread({ postId, counts={}, onChanged }) {
  const [items, setItems] = useState([]);
  const [text, setText] = useState("");

  async function refresh() {
    const { data, error } = await supabase
      .from("feed_comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
    if (!error) setItems(data || []);
  }
  useEffect(() => { refresh(); }, [postId]);

  async function submit() {
    if (!text.trim()) return;
    await addComment(postId, text.trim());
    setText(""); await refresh(); onChanged?.();
  }

  return (
    <div className={css.wrap}>
      <div className={css.count}>{(counts.comments||0)} comments</div>
      {items.map(c => (
        <div key={c.id} className={css.row}>
          <div className={css.avatar}>👤</div>
          <div className={css.bubble}>
            <div className={css.name}>User</div>
            <div className={css.body}>{c.body}</div>
          </div>
        </div>
      ))}
      <div className={css.compose}>
        <input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a comment..." />
        <button onClick={submit}>Comment</button>
      </div>
    </div>
  );
}



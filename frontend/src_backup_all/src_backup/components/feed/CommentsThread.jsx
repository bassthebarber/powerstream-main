import { useEffect, useState } from "react";
import { addComment, fetchComments } from "../../services/feedExtras";
import css from "../../styles/Feed.module.css";

export default function CommentsThread({ postId }) {
  const [items, setItems] = useState([]);
  const [draft, setDraft] = useState("");

  useEffect(() => { (async () => setItems(await fetchComments(postId)))(); }, [postId]);

  async function send() {
    const body = draft.trim(); if (!body) return;
    const row = await addComment({ post_id: postId, body, user_name: "Guest" });
    setItems((x) => [...x, row]);
    setDraft("");
  }

  return (
    <div className={css.commentsBox}>
      {items.map(c => (
        <div key={c.id} className={css.commentItem}>
          <strong>{c.user_name || "Guest"}:</strong> {c.body}
        </div>
      ))}
      <div className={css.commentComposer}>
        <input value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Write a comment…" />
        <button onClick={send}>Send</button>
      </div>
    </div>
  );
}



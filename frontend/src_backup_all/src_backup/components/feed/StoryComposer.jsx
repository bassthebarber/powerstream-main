import { useState, useRef } from "react";
import { uploadStory } from "../../hooks/useStories";
import css from "../../styles/Feed.module.css";

export default function StoryComposer({ open, onClose, onDone }) {
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  if (!open) return null;

  async function handleUpload(e) {
    e.preventDefault();
    const f = fileRef.current?.files?.[0];
    if (!f) return;
    try {
      setBusy(true);
      await uploadStory(f, caption);
      setCaption("");
      onDone?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={css.viewer} role="dialog" aria-modal="true">
      <div className={css.viewerCard}>
        <div className={css.viewerTop}>
          <strong>Create story</strong>
          <button className={css.closeBtn} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleUpload} className={css.composeForm}>
          <div className={css.row}>
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileRef}
              required
            />
          </div>
          <div className={css.row}>
            <input
              type="text"
              placeholder="Say something about this..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </div>
          <div className={css.viewerNav}>
            <button type="submit" disabled={busy}>
              {busy ? "Uploading..." : "Post story"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}



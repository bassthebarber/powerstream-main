// src/components/feed/BookmarkButton.jsx
import { toggleBookmark } from "../../services/feedApi";

export default function BookmarkButton({ postId, onChanged, children = "Save" }) {
  async function onSave() { await toggleBookmark(postId); onChanged?.(); }
  return <button onClick={onSave}>{children}</button>;
}



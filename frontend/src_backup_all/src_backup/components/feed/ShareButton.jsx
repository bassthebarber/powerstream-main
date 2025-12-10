// src/components/feed/ShareButton.jsx
import { sharePost } from "../../services/feedApi";

export default function ShareButton({ postId, onChanged, children = "Share" }) {
  async function onShare() { await sharePost(postId); onChanged?.(); }
  return <button onClick={onShare}>{children}</button>;
}



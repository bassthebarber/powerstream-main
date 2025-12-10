import { useState } from "react";
import { useNavigate } from "react-router-dom";
import css from "../../styles/Feed.module.css";

export default function Composer() {
  const [text, setText] = useState("");
  const nav = useNavigate();

  function postText(e) {
    e.preventDefault();
    // left intentionally as-is (no changes to your posting behavior)
  }

  return (
    <div className={css.composer}>
      <form onSubmit={postText} className={css.composerForm}>
        <div className={css.composerTop}>
          <img src="/logos/powerstream-logo.png" alt="" className={css.postAvatar}/>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What's going on in your world?"
          />
          <button className={css.postBtn}>Post</button>
        </div>

        <div className={css.composerActions}>
          <button type="button" onClick={() => alert("Live coming soon")}>
            Live
          </button>

          {/* ✅ Only change: navigate, not open file picker */}
          <button type="button" onClick={() => nav("/upload")}>
            Photo/Video
          </button>

          <button type="button" onClick={() => alert("Feeling/Activity coming soon")}>
            Feeling/Activity
          </button>
        </div>
      </form>
    </div>
  );
}



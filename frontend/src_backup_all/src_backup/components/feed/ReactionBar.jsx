import { useEffect, useState } from "react";
import { getReactionCounts, setReaction } from "../../services/feedExtras";
import css from "../../styles/Feed.module.css";

const EMOJIS = [
  { key:"like",  label:"👍" },
  { key:"love",  label:"❤️" },
  { key:"haha",  label:"😂" },
  { key:"wow",   label:"😮" },
  { key:"sad",   label:"😢" },
  { key:"angry", label:"😡" },
];

export default function ReactionBar({ postId }) {
  const [counts, setCounts] = useState({});

  useEffect(() => { (async () => setCounts(await getReactionCounts(postId)))(); }, [postId]);

  async function react(key) {
    await setReaction(postId, key);
    setCounts(await getReactionCounts(postId));
  }

  return (
    <div className={css.reactionBar}>
      {EMOJIS.map(e => (
        <button key={e.key} onClick={() => react(e.key)} className={css.reactionBtn}>
          {e.label} <span className={css.reactionCount}>{counts[e.key]||0}</span>
        </button>
      ))}
    </div>
  );
}



import { useEffect, useState } from "react";
import { createPoll, pollResults, votePoll } from "../../services/feedExtras";

export default function Poll({ postId, initialQuestion, initialOptions = [] }) {
  const [poll, setPoll] = useState(null);
  const [results, setResults] = useState({ options: [], counts: {} });

  useEffect(() => { (async () => {
    if (initialQuestion) {
      const p = await createPoll(postId, initialQuestion, initialOptions);
      setPoll(p);
    }
  })(); }, [postId]); // create one on mount (optional pattern for demo)

  useEffect(() => { (async () => {
    if (!poll) return;
    setResults(await pollResults(poll.id));
  })(); }, [poll]);

  if (!poll) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontWeight: 700 }}>{initialQuestion}</div>
      {results.options.map(o => (
        <div key={o.id} style={{ display:"flex", alignItems:"center", gap:8, marginTop:6 }}>
          <button onClick={() => votePoll(poll.id, o.id)}>Vote</button>
          <span>{o.label}</span>
          <small>({results.counts[o.id] || 0})</small>
        </div>
      ))}
    </div>
  );
}



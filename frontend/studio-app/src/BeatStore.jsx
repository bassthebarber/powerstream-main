import { useEffect, useState } from "react";
import { getJSON, postJSON } from "../lib/api";

export default function BeatStore(){
  const [beats, setBeats] = useState([]);
  useEffect(()=>{ getJSON("/api/beats/list").then(r=> setBeats(r.items||[])); },[]);
  async function buy(b){
    const r = await postJSON("/api/beats/checkout", { title:b.title, url:b.url });
    if(r.mode==="free" || !r.url){ alert("Free mode: added to Library."); return; }
    window.location = r.url; // Stripe Checkout
  }
  return (
    <div className="page-wrap">
      <h1 className="h1">Beat Store</h1>
      <p>Browse your generated beats. Click a card to preview, purchase (optional), or use in the booth.</p>
      <div className="grid-cards">
        {beats.map(b=>(<div className="card" key={b.id}>
          <h3>{b.title}</h3>
          <audio controls src={b.url} style={{width:"100%"}}/>
          <div className="row gap">
            <a className="btn gold" href={`/player?url=${encodeURIComponent(b.url)}`}>▶ Use in Player</a>
            <button className="btn" onClick={()=>buy(b)}>💳 Buy</button>
            <a className="btn" target="_blank" rel="noreferrer" href={b.url}>Download</a>
          </div>
        </div>))}
        {!beats.length && <div className="card">No beats yet. Make one in the <a href="/beat-lab">Beat Lab</a>.</div>}
      </div>
    </div>
  );
}

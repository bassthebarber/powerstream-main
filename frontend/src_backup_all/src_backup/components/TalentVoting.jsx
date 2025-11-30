import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function TalentVoting({ stationSlug }) {
  const [contestants, setContestants] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    if(!supabase){ // demo fallback
      setContestants([{id:"demo1", name:"Alice"}, {id:"demo2", name:"Bob"}]);
      setCounts({ demo1:5, demo2:3 });
      setLoading(false);
      return;
    }
    const { data: show } = await supabase.from("talent_shows").select("*").eq("station_slug", stationSlug).eq("is_active",true).single();
    if(!show){ setLoading(false); return; }
    const { data: conts } = await supabase.from("contestants").select("*").eq("show_id", show.id).order("name");
    setContestants(conts||[]);
    const { data: tally } = await supabase.from("votes_tally").select("*").eq("show_id", show.id);
    const map = {}; (tally||[]).forEach(t=>{ map[t.contestant_id]=t.votes; });
    setCounts(map);
    setLoading(false);
  })(); },[stationSlug]);

  const vote = async (id) => {
    if(!supabase){ setCounts(c=>({ ...c, [id]:(c[id]||0)+1 })); return; }
    const { data: prof } = await supabase.from("profiles").select("id").limit(1).single();
    const user_id = prof?.id || null;
    const { error } = await supabase.rpc("cast_vote", { p_contestant_id:id, p_user_id:user_id });
    if(!error){ setCounts(c=>({ ...c, [id]:(c[id]||0)+1 })); }
  };

  if(loading) return <div className="card">Loading voting</div>;
  if(!contestants?.length) return <div className="card">Voting not active.</div>;

  return (
    <div className="card">
      <h3>Vote now</h3>
      <div className="grid-cards" style={{marginTop:10}}>
        {contestants.map(c=>(
          <div key={c.id} className="card" style={{textAlign:"center"}}>
            <div style={{fontWeight:700}}>{c.name}</div>
            <div style={{opacity:.8,margin:"6px 0"}}>{counts[c.id]||0} votes</div>
            <button className="btn" onClick={()=>vote(c.id)}>Vote</button>
          </div>
        ))}
      </div>
    </div>
  );
}



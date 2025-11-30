import React, { useState } from "react";
import styles from "../../styles/TVStations.module.css";

export default function TVGuide({ stationId }) {
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10));
  const [slots, setSlots] = useState([
    { time:"7:00 PM", show:"Open Mic", votes: 12 },
    { time:"8:00 PM", show:"Live Set A", votes: 8 },
    { time:"9:00 PM", show:"Interview", votes: 3 },
  ]);

  const vote = (i) => setSlots(s => s.map((x,idx)=> idx===i ? {...x, votes:x.votes+1} : x));

  return (
    <section className={styles.section}>
      <h3 className={styles.sectionTitle}>TV Guide</h3>
      <div className={styles.guideHead}>
        <label>Date</label>
        <input className={styles.input} type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        <div className={styles.note}>GET /api/guide?station={stationId}&date={date}</div>
      </div>

      <div className={styles.section}>
        {slots.map((s, i)=>(
          <div key={i} className={styles.guideRow} style={{marginBottom:8}}>
            <div className={styles.slot}>{s.time}</div>
            <div className={styles.slot}><b>{s.show}</b></div>
            <div className={styles.row}>
              <button className={styles.btn} onClick={()=>vote(i)}>Vote</button>
              <span className={styles.voteCount}>{s.votes} votes</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}



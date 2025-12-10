import React from "react";
import css from "../../../styles/StationView.module.css";
// import HlsPlayer from "../../../components/live/HlsPlayer.jsx";

export default function NoLimit(){
  // Paste your Livepeer playbackId and uncomment the player above
  // const playbackId = "YOUR_PLAYBACK_ID";
  return (
    <div className={css.wrap}>
      <div className={css.header}>
        <img src="/logos/nolimiteasthoustonlogo.png" alt="" className={css.logo}/>
        <div>
          <h1>No Limit East Houston</h1>
          <div className={css.sub}>Live • VOD • Schedule</div>
        </div>
      </div>

      <div className={css.sections}>
        <section className={css.card}>
          <h3>Live</h3>
          <div className={css.playerBox}>
            <div className={css.playerPlaceholder}>Add playbackId to show the live player</div>
            {/* <HlsPlayer playbackId={playbackId}/> */}
          </div>
        </section>

        <section className={css.card}>
          <h3>Recent Uploads</h3>
          <div className={css.grid}> {/* hook your Supabase query here */}</div>
        </section>

        <section className={css.card}>
          <h3>Schedule</h3>
          <p>Hook your schedules table here.</p>
        </section>
      </div>
    </div>
  );
}



import React, { useState } from 'react';

export default function LiveCreatePanel({ stationId='spn', onCreated }) {
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(null);

  const createLive = async () => {
    setBusy(true);
    const r = await fetch('/api/live/create', {
      method:'POST', headers:{'content-type':'application/json'},
      body: JSON.stringify({ stationId })
    });
    const data = await r.json();
    setBusy(false);
    setInfo(data);
    onCreated && onCreated(data);
  };

  return (
    <div style={{border:'1px solid #222', borderRadius:12, padding:12, background:'#0f0f0f', margin:'10px 0'}}>
      <h3 style={{color:'#ffd700', marginTop:0}}>Go Live</h3>
      <button onClick={createLive} disabled={busy}>{busy ? 'Creating…' : 'Create Stream'}</button>
      {info?.ok && (
        <div style={{marginTop:8, color:'#ccc'}}>
          <div><b>RTMP ingest:</b> {info.rtmp}</div>
          <div><b>Playback (HLS):</b> {info.hls}</div>
          <div><b>streamId:</b> {info.streamId}</div>
          <div style={{fontSize:12, color:'#999'}}>Paste RTMP URL in OBS/Streamlabs, start streaming.</div>
        </div>
      )}
    </div>
  );
}



import React, { useEffect, useState } from 'react';
import { attachHls } from '../../lib/hlsPlayer';

function VodItem({ playbackId }) {
  const id = `vod-${playbackId}`;
  useEffect(()=>{
    const el = document.getElementById(id);
    if (!el) return;
    const src = `https://livepeercdn.com/hls/${playbackId}/index.m3u8`;
    const Hls = (window).Hls || null; // optional if you want to import globally
  },[id]);
  return (
    <div style={{border:'1px solid #222', borderRadius:12, padding:10, background:'#0f0f0f'}}>
      <video controls playsInline src={`https://livepeercdn.com/hls/${playbackId}/index.m3u8`} style={{width:'100%', height:220, background:'#000', borderRadius:10}} />
      <div style={{color:'#999', marginTop:6}}>{playbackId}</div>
    </div>
  );
}

export default function RecordingLibrary({ stationId='spn' }) {
  const [items, setItems] = useState([]);
  useEffect(()=>{
    (async ()=>{
      const r = await fetch(`/api/assets?station=${stationId}`);
      const data = await r.json();
      if (data.ok) setItems(data.items);
    })();
  },[stationId]);
  return (
    <section style={{marginTop:12}}>
      <h3 style={{color:'#ffd700'}}>Recorded Library</h3>
      <div style={{display:'grid', gap:12, gridTemplateColumns:'repeat(3,1fr)'}}>
        {items.map(it => <VodItem key={it.id} playbackId={it.playback_id} />)}
      </div>
    </section>
  );
}



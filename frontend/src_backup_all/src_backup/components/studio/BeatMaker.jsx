import React, { useEffect, useMemo, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "/api/studio";

// --- helper: convert AudioBuffer to WAV Blob ---
function audioBufferToWavBlob(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const bufferArray = new ArrayBuffer(length);
  const view = new DataView(bufferArray);
  let offset = 0;

  function writeString(s) { for (let i=0;i<s.length;i++) view.setUint8(offset++, s.charCodeAt(i)); }
  function writeUint32(d) { view.setUint32(offset, d, true); offset += 4; }
  function writeUint16(d) { view.setUint16(offset, d, true); offset += 2; }

  writeString('RIFF'); writeUint32(length - 8); writeString('WAVE');
  writeString('fmt '); writeUint32(16); writeUint16(1);
  writeUint16(numOfChan); writeUint32(buffer.sampleRate);
  writeUint32(buffer.sampleRate * numOfChan * 2);
  writeUint16(numOfChan * 2); writeUint16(16);
  writeString('data'); writeUint32(length - 44);

  const channels = [];
  for (let i=0;i<numOfChan;i++) channels.push(buffer.getChannelData(i));

  let pos = 0;
  while (pos < buffer.length) {
    for (let i=0;i<numOfChan;i++) {
      let sample = Math.max(-1, Math.min(1, channels[i][pos]));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
    pos++;
  }
  return new Blob([bufferArray], { type: "audio/wav" });
}

// --- synths for drums (no samples) ---
function addKick(ctx, t, gain = 1.0) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(150, t);
  o.frequency.exponentialRampToValueAtTime(50, t + 0.12);
  g.gain.setValueAtTime(0.9 * gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.16);
}
function addSnare(ctx, t, gain = 0.8) {
  // tone
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = "triangle"; o.frequency.setValueAtTime(180, t);
  g.gain.setValueAtTime(0.25 * gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
  o.connect(g).connect(ctx.destination);
  o.start(t); o.stop(t + 0.13);
  // noise
  const bufferSize = ctx.sampleRate * 0.2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = Math.random()*2-1;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;
  const ng = ctx.createGain();
  ng.gain.setValueAtTime(0.6 * gain, t);
  ng.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
  noise.connect(ng).connect(ctx.destination);
  noise.start(t); noise.stop(t + 0.2);
}
function addHat(ctx, t, gain = 0.5, open=false) {
  const bufferSize = ctx.sampleRate * (open ? 0.35 : 0.08);
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1) * (open ? 0.9 : 0.6);
  const noise = ctx.createBufferSource(); noise.buffer = noiseBuffer;
  const bp = ctx.createBiquadFilter(); bp.type="highpass"; bp.frequency.value = 7000;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + (open?0.35:0.08));
  noise.connect(bp).connect(g).connect(ctx.destination);
  noise.start(t); noise.stop(t + (open?0.36:0.09));
}

export default function BeatMaker(){
  const steps = 16;
  const initial = useMemo(()=>({
    kick: Array(steps).fill(false).map((_,i)=> i%4===0 ),
    snare: Array(steps).fill(false).map((_,i)=> i%8===4 ),
    hat:   Array(steps).fill(false).map((_,i)=> i%2===0 ),
  }), []);
  const [pattern, setPattern] = useState(initial);
  const [bpm, setBpm] = useState(92);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [email, setEmail] = useState("");
  const timerRef = useRef(null);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);

  useEffect(()=>()=> stop(),[]);

  const toggle = (row, i) => {
    setPattern(p => ({ ...p, [row]: p[row].map((v,idx)=> idx===i ? !v : v) }));
  };

  const scheduleStep = (index) => {
    if (!ctxRef.current) return;
    const ctx = ctxRef.current;
    const now = ctx.currentTime;
    const sixteenth = 60 / bpm / 4; // 16ths
    const t = now + 0.03; // tiny lookahead

    if (pattern.kick[index])  addKick(ctx, t, 1.0 * volume);
    if (pattern.snare[index]) addSnare(ctx, t, 0.9 * volume);
    if (pattern.hat[index])   addHat(ctx, t, 0.55 * volume, index%4===3);

    setCurrent(index);
    const next = (index + 1) % steps;
    timerRef.current = setTimeout(() => scheduleStep(next), sixteenth * 1000);
  };

  const play = () => {
    if (playing) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const master = ctx.createGain();
    master.gain.value = volume;
    master.connect(ctx.destination);
    masterRef.current = master;
    setPlaying(true);
    scheduleStep(0);
  };

  const stop = () => {
    setPlaying(false);
    clearTimeout(timerRef.current);
    timerRef.current = null;
    setCurrent(0);
    if(ctxRef.current){ ctxRef.current.close(); ctxRef.current = null; }
  };

  const renderToWav = async () => {
    // Render 2 bars to WAV using OfflineAudioContext
    const bars = 2;
    const sr = 44100;
    const secondsPerBeat = 60 / bpm;
    const secondsPerBar = secondsPerBeat * 4;
    const totalSec = secondsPerBar * bars;
    const offline = new OfflineAudioContext(2, Math.ceil(totalSec * sr), sr);

    // override synths to use offline ctx
    const schedule = (index, t) => {
      if (pattern.kick[index])  addKick(offline, t, 1.0);
      if (pattern.snare[index]) addSnare(offline, t, 0.9);
      if (pattern.hat[index])   addHat(offline, t, 0.6, index%4===3);
    };
    const sixteenth = secondsPerBeat / 4;
    let t = 0;
    for (let bar=0; bar<bars; bar++){
      for (let i=0;i<steps;i++){
        schedule(i, t);
        t += sixteenth;
      }
    }
    const rendered = await offline.startRendering();
    return audioBufferToWavBlob(rendered);
  };

  const exportAndUpload = async () => {
    try{
      const wav = await renderToWav();
      const file = new File([wav], `powerstream-beat-${Date.now()}.wav`, { type: "audio/wav" });

      const fd = new FormData();
      fd.append("file", file);
      if(email) fd.append("email", email);

      const r = await fetch(`${API}/upload`, { method:"POST", body: fd });
      const data = await r.json();
      if(!data.ok) throw new Error(data.error || "Upload failed");

      if(email){
        await fetch(`${API}/email`, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ id: data.id, to: email })
        }).catch(()=>{});
      }

      alert("✅ Beat exported & uploaded!\n" + data.url);
      window.open(data.url, "_blank");
    }catch(e){
      console.error(e);
      alert("Export/Upload failed: " + e.message);
    }
  };

  const exportWavToDisk = async () => {
    const wav = await renderToWav();
    const url = URL.createObjectURL(wav);
    const a = document.createElement("a");
    a.href = url; a.download = "powerstream-beat.wav";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url), 5000);
  };

  return (
    <div className="ps-card">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{fontWeight:800,color:"#f4c430"}}>Beat Maker</div>
        <div className="ps-controls" style={{marginTop:0}}>
          {!playing ? (
            <button className="ps-btn" onClick={play}>▶ Play</button>
          ) : (
            <button className="ps-btn solid" onClick={stop}>■ Stop</button>
          )}
          <button className="ps-btn" onClick={()=>setPattern({...pattern})}>Quantize</button>
        </div>
      </div>

      {/* Controls */}
      <div className="ps-controls">
        <div className="badge">BPM</div>
        <input className="input" type="number" min="60" max="180" value={bpm}
               onChange={e=>setBpm(parseInt(e.target.value||"0")||92)}
               style={{width:90}}/>
        <div className="badge">Volume</div>
        <input className="input" type="range" min="0" max="1" step="0.01"
               value={volume} onChange={e=>setVolume(parseFloat(e.target.value))}
               style={{width:180}}/>
      </div>

      {/* Step grid */}
      <StepRow name="Kick"    color="#f4c430" steps={steps} arr={pattern.kick}  current={current} onToggle={(i)=>toggle("kick", i)}/>
      <StepRow name="Snare"   color="#33ff66" steps={steps} arr={pattern.snare} current={current} onToggle={(i)=>toggle("snare", i)}/>
      <StepRow name="Hi-Hat"  color="#9aa0a6" steps={steps} arr={pattern.hat}   current={current} onToggle={(i)=>toggle("hat", i)}/>

      {/* Export / Email */}
      <div className="ps-grid" style={{marginTop:12}}>
        <div>
          <div className="ps-controls">
            <button className="ps-btn" onClick={exportWavToDisk}>⬇️ Export WAV (download)</button>
            <button className="ps-btn solid" onClick={exportAndUpload}>⬆️ Export → Upload (send link)</button>
          </div>
        </div>
        <div className="ps-side">
          <div className="label">Send link to email (optional)</div>
          <input className="email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          <div className="ps-hint" style={{marginTop:6}}>When provided, your beat is emailed after upload.</div>
        </div>
      </div>
    </div>
  );
}

function StepRow({ name, color, steps, arr, onToggle, current }){
  return (
    <div style={{marginTop:12}}>
      <div style={{fontSize:13, color:"#9aa0a6", marginBottom:6}}>{name}</div>
      <div style={{display:"grid", gridTemplateColumns:`repeat(${steps}, minmax(0,1fr))`, gap:6}}>
        {arr.map((on,i)=>(
          <button
            key={i}
            onClick={()=>onToggle(i)}
            className="ps-btn"
            style={{
              padding:"12px 0",
              borderColor:on ? color : "rgba(244,196,48,.25)",
              background: on ? color : "transparent",
              color: on ? "#111" : "#f4c430",
              position:"relative"
            }}
            title={`${name} – step ${i+1}`}
          >
            {((i%4)===0) && (
              <span style={{
                position:"absolute", top:2, left:6, fontSize:10,
                color:"#9aa0a6"
              }}>{(i/4)+1}</span>
            )}
            {current===i && (
              <span style={{
                position:"absolute", bottom:2, left:"50%", transform:"translateX(-50%)",
                width:6, height:6, borderRadius:999, background:"#fff"
              }}/>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

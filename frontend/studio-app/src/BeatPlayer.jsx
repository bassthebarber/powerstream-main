import { useEffect, useRef, useState } from "react";

export default function BeatPlayer(){
  const url = new URLSearchParams(location.search).get("url") || "";
  const audioRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const mediaRec = useRef(null);
  const chunks = useRef([]);

  async function startRec(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const mr = new MediaRecorder(stream);
    chunks.current = [];
    mr.ondataavailable = e => chunks.current.push(e.data);
    mr.onstop = ()=>{ const blob = new Blob(chunks.current,{type:"audio/webm"});
      const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="vocal-take.webm"; a.click();
    };
    mediaRec.current = mr; mr.start(); setRecording(true);
  }
  function stopRec(){ mediaRec.current?.stop(); setRecording(false); }

  useEffect(()=>{ audioRef.current?.play().catch(()=>{}); },[url]);

  return (
    <div className="page-wrap">
      <h1 className="h1">Beat Player</h1>
      <p>Load a beat and record vocals on top (download vocal take at stop).</p>
      <div className="card">
        <audio ref={audioRef} controls src={url} style={{width:"100%"}}/>
        <div className="row gap">
          {!recording ? <button className="btn green" onClick={startRec}>🎙 Start Recording</button>
                      : <button className="btn" onClick={stopRec}>■ Stop & Download</button>}
          <input className="input" placeholder="Or paste beat URL…" defaultValue={url}
                 onKeyDown={e=>{ if(e.key==="Enter") location.href=`/player?url=${encodeURIComponent(e.target.value)}`; }}/>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef, useState } from "react";

const API = import.meta.env.VITE_API_BASE || "/api/studio";
const BRAND = import.meta.env.VITE_BRAND_NAME || "Southern Power AI Studio";

export default function StudioUploader(){
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [download, setDownload] = useState(null); // {url,id}
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");
  const [err, setErr] = useState("");
  const chunksRef = useRef([]);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const srcNodeRef = useRef(null);
  const rafRef = useRef(null);

  // -------- waveform while recording ----------
  const draw = () => {
    const canvas = canvasRef.current;
    if(!canvas) return;
    const analyser = analyserRef.current;
    if(!analyser) return;

    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteTimeDomainData(dataArray);
      ctx.fillStyle = "#080808";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#f4c430";
      ctx.beginPath();
      const slice = canvas.width / bufferLength;
      let x = 0;
      for(let i=0;i<bufferLength;i++){
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        x += slice;
      }
      ctx.lineTo(canvas.width, canvas.height/2);
      ctx.stroke();
      rafRef.current = requestAnimationFrame(render);
    };
    render();
  };
  const stopDrawing = () => {
    if(rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  };

  const startRecord = async () => {
    setErr("");
    try{
      const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
      const mr = new MediaRecorder(stream);
      setMediaRecorder(mr);
      chunksRef.current = [];
      mr.ondataavailable = e => e.data.size && chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        const f = new File([blob], "recording.webm", { type: "audio/webm" });
        setFile(f);
        // cleanup audio graph
        stopDrawing();
        if(srcNodeRef.current) srcNodeRef.current.disconnect();
        if(analyserRef.current) analyserRef.current.disconnect();
        if(audioCtxRef.current) audioCtxRef.current.close();
      };
      mr.start();
      setRecording(true);

      // waveform live
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      srcNodeRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      source.connect(analyser);
      draw();
    }catch(e){
      console.error(e);
      setErr("Microphone access denied or unavailable.");
    }
  };
  const stopRecord = () => {
    if(mediaRecorder && recording){
      mediaRecorder.stop();
      setRecording(false);
      mediaRecorder.stream.getTracks().forEach(t=>t.stop());
    }
  };

  // waveform for selected file
  useEffect(()=>{
    if(!file || recording) return;
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#080808"; ctx.fillRect(0,0,canvas.width,canvas.height);

    const reader = new FileReader();
    reader.onload = async () => {
      try{
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const ab = await audioCtx.decodeAudioData(reader.result);
        const channel = ab.getChannelData(0);
        const width = canvas.width, height = canvas.height;
        ctx.fillStyle = "#080808"; ctx.fillRect(0,0,width,height);
        ctx.strokeStyle = "#f4c430"; ctx.lineWidth = 2; ctx.beginPath();

        const step = Math.ceil(channel.length / width);
        const amp = height / 2;
        for (let i = 0; i < width; i++) {
          let min = 1.0; let max = -1.0;
          for (let j = 0; j < step; j++) {
            const datum = channel[(i * step) + j] || 0;
            if (datum < min) min = datum;
            if (datum > max) max = datum;
          }
          ctx.moveTo(i, (1 + min) * amp);
          ctx.lineTo(i, (1 + max) * amp);
        }
        ctx.stroke();
        await audioCtx.close();
      }catch(e){}
    };
    reader.readAsArrayBuffer(file);
  }, [file, recording]);

  const onDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if(f) { setFile(f); setAudioURL(URL.createObjectURL(f)); setDownload(null); }
  };
  const onPick = (e) => {
    const f = e.target.files?.[0];
    if(f) { setFile(f); setAudioURL(URL.createObjectURL(f)); setDownload(null); }
  };

  const upload = async () => {
    try{
      if(!file){ setErr("Select or record an audio file first."); return; }
      setStatus("Uploading..."); setErr(""); setDownload(null);
      const fd = new FormData();
      fd.append("file", file);
      if(email) fd.append("email", email);

      const r = await fetch(`${API}/upload`, { method:"POST", body: fd });
      const data = await r.json();
      if(!data.ok) throw new Error(data.error || "Upload failed");

      setDownload({ url: data.url, id: data.id });

      if(email){
        await fetch(`${API}/email`, {
          method:"POST",
          headers:{ "Content-Type":"application/json" },
          body: JSON.stringify({ id: data.id, to: email })
        }).catch(()=>{});
      }

      setStatus("Done");
    }catch(e){
      console.error(e);
      setErr(e.message);
      setStatus("");
    }
  };

  return (
    <div className="ps-card">
      <div className="ps-grid">
        <div>
          <div
            className="ps-drop"
            onDragOver={(e)=>e.preventDefault()}
            onDrop={onDrop}
            onClick={()=>document.getElementById("filepick").click()}
            role="button"
            tabIndex={0}
          >
            <input id="filepick" type="file" accept="audio/*" onChange={onPick}/>
            <div style={{fontWeight:800,fontSize:18,color:"#f4c430"}}>{BRAND}</div>
            <div style={{marginTop:6}}>Drop audio here, or click to choose</div>
            <div className="ps-hint">MP3, WAV, M4A, WEBM. Or record below.</div>
          </div>

          <div style={{marginTop:14}}>
            <canvas ref={canvasRef} className="ps-can" width="1000" height="140"/>
          </div>

          {audioURL && (
            <audio className="ps-audio" src={audioURL} controls preload="metadata"/>
          )}

          <div className="ps-controls">
            {!recording ? (
              <button className="ps-btn" onClick={startRecord}>🎙️ Record</button>
            ) : (
              <button className="ps-btn solid" onClick={stopRecord}>■ Stop</button>
            )}
            <button className="ps-btn" onClick={()=>{ setFile(null); setAudioURL(""); setDownload(null); }}>Reset</button>
            <button className="ps-btn solid" onClick={upload}>⬆️ Upload</button>
            {status && <span className="badge ok">{status}</span>}
            {err && <span className="badge err">{err}</span>}
          </div>
        </div>

        <div className="ps-side">
          <div className="label">Send link to email (optional)</div>
          <input className="email" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)}/>
          <div className="label">Result</div>
          <div className="result">
            {download ? (
              <>
                ✅ Uploaded<br/>
                <a className="link" href={download.url} target="_blank" rel="noreferrer">Download your file</a>
                <div className="ps-hint" style={{marginTop:8}}>A copy is sent to your email if provided.</div>
              </>
            ) : <span className="ps-hint">Upload to get your download link here.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import {
  uploadToStudio, listAssets, deleteAsset, aiMix, aiMaster, requestExport
} from "../api/studioApi";

// --- small helpers ---
function cls(...a){return a.filter(Boolean).join(" ");}

// --- Navbar tabs ---
const TABS = ["Record","Upload","Library","Mix","Master","Export","Settings"];

export default function StudioDAW(){
  const [tab,setTab] = useState("Record");

  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <header className="sticky top-0 z-10 bg-neutral-900/80 backdrop-blur border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="text-brand-gold font-extrabold text-xl tracking-wide">PowerStream Studio</div>
          <nav className="ml-auto flex gap-2 flex-wrap">
            {TABS.map(t => (
              <button key={t}
                onClick={()=>setTab(t)}
                className={cls(
                  "px-3 py-1.5 rounded-xl",
                  tab===t ? "bg-brand-gold text-black shadow-soft" : "bg-neutral-800 hover:bg-neutral-700"
                )}
              >{t}</button>
            ))}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-6">
        {tab==="Record"  && <RecordPanel />}
        {tab==="Upload"  && <UploadPanel />}
        {tab==="Library" && <LibraryPanel />}
        {tab==="Mix"     && <MixPanel />}
        {tab==="Master"  && <MasterPanel />}
        {tab==="Export"  && <ExportPanel />}
        {tab==="Settings"&& <SettingsPanel />}
      </main>
    </div>
  );
}

/* ===================== RECORD ===================== */
function RecordPanel(){
  const [mediaStream,setMediaStream]=useState(null);
  const [rec,setRec]=useState(null);
  const [chunks,setChunks]=useState([]);
  const [blob,setBlob]=useState(null);
  const [url,setUrl]=useState("");
  const [title,setTitle]=useState("");
  const [artist,setArtist]=useState("");
  const [email,setEmail]=useState("");
  const [progress,setProgress]=useState(0);
  const [recording,setRecording]=useState(false);

  useEffect(()=>()=>{ mediaStream?.getTracks().forEach(t=>t.stop()); if(url) URL.revokeObjectURL(url); },[mediaStream,url]);

  async function ensure(){
    if(rec) return rec;
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    setMediaStream(stream);
    const mr = new MediaRecorder(stream, { mimeType:"audio/webm" });
    mr.ondataavailable = e => setChunks(p=>p.concat(e.data));
    mr.onstop = () => {
      const b = new Blob(chunksRef.current, { type:"audio/webm" });
      const u = URL.createObjectURL(b); setBlob(b); setUrl(u);
    };
    setRec(mr); return mr;
  }
  const chunksRef=useRef([]); useEffect(()=>{chunksRef.current=chunks;},[chunks]);

  async function start(){ setChunks([]); const r=await ensure(); r.start(); setRecording(true); }
  function stop(){ if(rec?.state==="recording"){ rec.stop(); setRecording(false);} }
  function redo(){ setChunks([]); setBlob(null); if(url) URL.revokeObjectURL(url); setUrl(""); }

  async function upload(){
    const file = new File([blob], (title||"take") + ".webm", { type:"audio/webm" });
    await uploadToStudio({ file, kind:"vocal", title, artist, email }, setProgress);
    setProgress(0); alert("Uploaded!");
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">🎙️ Record</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <div className="flex gap-2">
          {!recording ? (
            <button onClick={start} className="bg-brand-gold text-black">● Start</button>
          ) : (
            <button onClick={stop} className="bg-brand-gold text-black">■ Stop</button>
          )}
          <button onClick={redo} className="bg-neutral-800">↺ Redo</button>
        </div>

        <div className="mt-4 flex gap-3 flex-wrap">
          <Input label="Title" value={title} set={setTitle}/>
          <Input label="Artist" value={artist} set={setArtist}/>
          <Input label="Email"  value={email}  set={setEmail}/>
        </div>

        {url && (
          <div className="mt-4">
            <audio controls src={url} className="w-full" />
            <div className="mt-2 flex items-center gap-3">
              <button onClick={upload} className="bg-brand-gold text-black">⬆ Upload Take</button>
              {progress>0 && progress<100 && <span>Uploading… {progress}%</span>}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

/* ===================== UPLOAD ===================== */
function UploadPanel(){
  const [file,setFile]=useState(null);
  const [kind,setKind]=useState("audio");
  const [title,setTitle]=useState("");
  const [artist,setArtist]=useState("");
  const [email,setEmail]=useState("");
  const [progress,setProgress]=useState(0);
  const [busy,setBusy]=useState(false);
  const [result,setResult]=useState(null);
  const [err,setErr]=useState("");

  async function go(e){
    e.preventDefault();
    setBusy(true); setErr(""); setResult(null); setProgress(0);
    try{
      const res = await uploadToStudio({ file, kind, title, artist, email }, setProgress);
      setResult(res);
    }catch(ex){ setErr(ex.message); }
    finally{ setBusy(false); }
  }
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">⬆ Upload</h2>
      <form onSubmit={go} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid gap-3">
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-sm text-neutral-400 mb-1">Media Type</label>
            <select value={kind} onChange={e=>setKind(e.target.value)} className="bg-neutral-800 rounded-xl px-3 py-2">
              {["audio","beat","vocal","mix","master","image","video"].map(k=><option key={k} value={k}>{k}</option>)}
            </select>
          </div>
          <Input label="Title" value={title} set={setTitle}/>
          <Input label="Artist" value={artist} set={setArtist}/>
          <Input label="Email" value={email} set={setEmail}/>
          <div>
            <label className="block text-sm text-neutral-400 mb-1">File</label>
            <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)} />
          </div>
        </div>
        {busy && <div>Uploading… {progress}%</div>}
        <button disabled={!file||busy} className="bg-brand-gold text-black">{busy?"Uploading…":"Upload to Studio"}</button>
        {err && <div className="text-red-400">{err}</div>}
        {result && <pre className="text-xs bg-black/60 p-2 rounded-xl overflow-auto">{JSON.stringify(result,null,2)}</pre>}
      </form>
    </section>
  );
}

/* ===================== LIBRARY ===================== */
function LibraryPanel(){
  const [kind,setKind]=useState("all");
  const [q,setQ]=useState("");
  const [items,setItems]=useState([]);
  const [busy,setBusy]=useState(false);
  const [sel,setSel]=useState({});

  async function load(){
    setBusy(true);
    try{
      const data = await listAssets({ kind, q });
      setItems(data.items||[]); setSel({});
    } finally { setBusy(false); }
  }
  useEffect(()=>{ load(); },[]);

  const picked = items.filter(i=>sel[i._id]);

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">📚 Library</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <div className="flex gap-2 flex-wrap">
          <select value={kind} onChange={e=>setKind(e.target.value)} className="bg-neutral-800 rounded-xl px-3 py-2">
            {["all","audio","beat","vocal","mix","master","image","video"].map(k=><option key={k} value={k}>{k}</option>)}
          </select>
          <input placeholder="Search title/artist…" value={q} onChange={e=>setQ(e.target.value)}
                 className="bg-neutral-800 rounded-xl px-3 py-2 w-64" />
          <button onClick={load} className="bg-brand-gold text-black">Search</button>
          <span className="ml-auto text-neutral-400">{picked.length} selected</span>
        </div>

        {busy && <div className="mt-3">Loading…</div>}

        <div className="mt-4 grid gap-3">
          {items.map(it=>(
            <div key={it._id} className="bg-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!sel[it._id]} onChange={()=>setSel(s=>({ ...s, [it._id]: !s[it._id] }))}/>
                  <div>
                    <div className="font-bold">{it.title||"(untitled)"} <span className="text-neutral-400">• {it.kind}</span></div>
                    <div className="text-xs text-neutral-400">{it.artist||""}</div>
                  </div>
                </label>
                <div className="flex items-center gap-2">
                  <a target="_blank" href={it.secure_url} className="px-3 py-1.5 bg-neutral-700 rounded-xl">Open</a>
                  <button className="bg-red-900/60" onClick={async()=>{
                    if(!confirm("Delete asset?")) return;
                    await deleteAsset(it._id); await load();
                  }}>Delete</button>
                </div>
              </div>
              <div className="mt-2">
                {it.resource_type==="video"||it.secure_url?.endsWith(".webm")
                  ? <video controls src={it.secure_url} className="max-w-full rounded-xl" />
                  : it.resource_type==="image"
                    ? <img src={it.secure_url} className="max-w-xs rounded-xl" />
                    : <audio controls src={it.secure_url} className="w-full" />}
              </div>
            </div>
          ))}
          {!items.length && !busy && <div className="text-neutral-400">No items yet.</div>}
        </div>
      </div>
    </section>
  );
}

/* ===================== MIX ===================== */
function MixPanel(){
  const [tracks,setTracks]=useState([]); // {assetId,title,artist,secure_url,gain,pan,start,muted,solo}
  const [selectedFromLib,setSelectedFromLib]=useState("");// comma-separated assetIds

  function patch(i,p){ setTracks(t=>{ const c=[...t]; c[i]={...c[i],...p}; return c; }); }
  function remove(i){ setTracks(t=>t.filter((_,k)=>k!==i)); }

  async function addFromIds(){
    const ids = selectedFromLib.split(",").map(s=>s.trim()).filter(Boolean);
    if(!ids.length) return alert("Add assetIds from Library (comma-separated).");
    // fetch metadata by listing and filtering (quick client-side approach)
    const { items } = await listAssets({ kind:"all", q:"" });
    const chosen = items.filter(a=>ids.includes(String(a._id))).map((a,i)=>({
      assetId:a._id, title:a.title||"", artist:a.artist||"", secure_url:a.secure_url,
      gain:1, pan:0, start:0, muted:false, solo:false
    }));
    setTracks(t=>t.concat(chosen));
  }

  async function runAiMix(){
    const ids = tracks.map(t=>t.assetId);
    if(!ids.length) return alert("Add tracks first.");
    const res = await aiMix(ids);
    alert("AI Mix accepted:\n"+JSON.stringify(res,null,2));
  }

  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">🎚️ Mix</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid gap-3">
        <div className="flex gap-2 flex-wrap">
          <input className="bg-neutral-800 rounded-xl px-3 py-2 grow"
            placeholder="Paste assetIds from Library (comma-separated)"
            value={selectedFromLib} onChange={e=>setSelectedFromLib(e.target.value)} />
          <button onClick={addFromIds} className="bg-brand-gold text-black">➕ Add Tracks</button>
          <button onClick={runAiMix} className="bg-brand-gold text-black">✨ AI Mix</button>
        </div>

        {!tracks.length && <div className="text-neutral-400">Add some tracks to begin.</div>}
        <div className="grid gap-3">
          {tracks.map((t,i)=>(
            <div key={i} className="bg-neutral-800 rounded-xl p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-bold">{t.title} <span className="text-neutral-400">• {t.artist}</span></div>
                <button className="bg-neutral-700" onClick={()=>remove(i)}>Remove</button>
              </div>
              <div className="mt-2">{t.secure_url?.endsWith(".webm")||t.secure_url?.includes(".mp4")
                ? <video controls src={t.secure_url} className="w-full rounded-xl"/>
                : <audio controls src={t.secure_url} className="w-full"/>}
              </div>
              <div className="mt-2 grid md:grid-cols-5 gap-2 text-sm">
                <Slider label="Gain" min={0} max={2} step={0.01} val={t.gain} on={v=>patch(i,{gain:v})}/>
                <Slider label="Pan"  min={-1} max={1} step={0.01} val={t.pan}  on={v=>patch(i,{pan:v})}/>
                <Num label="Start (s)" val={t.start} on={v=>patch(i,{start:v})}/>
                <Check label="Mute"  val={t.muted} on={v=>patch(i,{muted:v})}/>
                <Check label="Solo"  val={t.solo}  on={v=>patch(i,{solo:v})}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===================== MASTER ===================== */
function MasterPanel(){
  const [assetId,setAssetId]=useState("");
  async function run(){
    if(!assetId) return alert("Paste an assetId from Library.");
    const res=await aiMaster(assetId); alert("AI Master accepted:\n"+JSON.stringify(res,null,2));
  }
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">🧠 Master</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
        <input className="bg-neutral-800 rounded-xl px-3 py-2 w-full" placeholder="assetId…" value={assetId} onChange={e=>setAssetId(e.target.value)} />
        <button onClick={run} className="mt-3 bg-brand-gold text-black">✨ AI Master</button>
      </div>
    </section>
  );
}

/* ===================== EXPORT ===================== */
function ExportPanel(){
  const [ids,setIds]=useState("");
  const [format,setFormat]=useState("wav");
  const [res,setRes]=useState(null);

  async function go(){
    const assetIds = ids.split(",").map(s=>s.trim()).filter(Boolean);
    if(!assetIds.length) return alert("Add assetIds");
    const out=await requestExport({ assetIds, format }); setRes(out);
  }
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">📦 Export</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid gap-3">
        <textarea rows={3} className="bg-neutral-800 rounded-xl px-3 py-2" placeholder="assetId1, assetId2, …" value={ids} onChange={e=>setIds(e.target.value)} />
        <div className="flex items-center gap-3">
          <span>Format</span>
          <select className="bg-neutral-800 rounded-xl px-3 py-2" value={format} onChange={e=>setFormat(e.target.value)}>
            <option value="wav">WAV</option><option value="mp3">MP3</option><option value="flac">FLAC</option>
          </select>
          <button onClick={go} className="bg-brand-gold text-black">Create Export</button>
        </div>
        {res && <pre className="text-xs bg-black/60 p-2 rounded-xl overflow-auto">{JSON.stringify(res,null,2)}</pre>}
      </div>
    </section>
  );
}

/* ===================== SETTINGS ===================== */
function SettingsPanel(){
  const [sampleRate,setSampleRate]=useState(48000);
  const [latency,setLatency]=useState("interactive");
  const [theme,setTheme]=useState("black-gold");
  useEffect(()=>{
    const s=localStorage.getItem("studio.settings");
    if(s){ try{ const o=JSON.parse(s); setSampleRate(o.sampleRate??48000); setLatency(o.latency??"interactive"); setTheme(o.theme??"black-gold"); }catch{} }
  },[]);
  function save(){ localStorage.setItem("studio.settings", JSON.stringify({ sampleRate, latency, theme })); alert("Saved."); }
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-extrabold text-brand-gold">⚙️ Settings</h2>
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 grid gap-3">
        <Num label="Sample Rate" val={sampleRate} on={setSampleRate}/>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Latency</label>
          <select className="bg-neutral-800 rounded-xl px-3 py-2" value={latency} onChange={e=>setLatency(e.target.value)}>
            <option value="interactive">Interactive</option>
            <option value="playback">Playback</option>
            <option value="balanced">Balanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-neutral-400 mb-1">Theme</label>
          <select className="bg-neutral-800 rounded-xl px-3 py-2" value={theme} onChange={e=>setTheme(e.target.value)}>
            <option value="black-gold">Black + Gold</option>
            <option value="dark">Dark</option>
            <option value="light">Light</option>
          </select>
        </div>
        <button onClick={save} className="bg-brand-gold text-black">Save</button>
      </div>
    </section>
  );
}

/* ========== tiny UI atoms ========== */
function Input({label,value,set}){ return (
  <div>
    <label className="block text-sm text-neutral-400 mb-1">{label}</label>
    <input className="bg-neutral-800 rounded-xl px-3 py-2" value={value} onChange={e=>set(e.target.value)} />
  </div>
);}
function Slider({label,min,max,step,val,on}){ return (
  <label className="block">
    <span className="block text-sm text-neutral-400 mb-1">{label}</span>
    <input type="range" min={min} max={max} step={step} value={val} onChange={e=>on(+e.target.value)} className="w-full" />
  </label>
);}
function Num({label,val,on}){ return (
  <label className="block">
    <span className="block text-sm text-neutral-400 mb-1">{label}</span>
    <input type="number" value={val} onChange={e=>on(+e.target.value)}
      className="bg-neutral-800 rounded-xl px-3 py-2 w-40" />
  </label>
);}
function Check({label,val,on}){ return (
  <label className="inline-flex items-center gap-2">
    <input type="checkbox" checked={val} onChange={e=>on(e.target.checked)} />
    <span className="text-sm">{label}</span>
  </label>
);}

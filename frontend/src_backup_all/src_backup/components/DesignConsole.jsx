import { useEffect, useState } from "react";
import { runCommand } from "@/ai/CommandRouter";
import { restoreLastPreset } from "@/ai/DesignEngine";

export default function DesignConsole(){
  const [cmd, setCmd] = useState("");
  const [log, setLog] = useState(["Type: preset facebook | preset instagram | preset tiktok"]);

  useEffect(() => { restoreLastPreset(); }, []);

  const onRun = (e) => {
    e.preventDefault();
    if(!cmd.trim()) return;
    const out = runCommand(cmd);
    setLog(l => [ `> ${cmd}`, out, ...l ]);
    setCmd("");
  };

  return (
    <div className="card" style={{position:"fixed", right:16, bottom:16, maxWidth:360, zIndex:1000}}>
      <strong>Design Console</strong>
      <form onSubmit={onRun} style={{marginTop:8}}>
        <input className="input" placeholder="preset facebook" value={cmd} onChange={e=>setCmd(e.target.value)} />
        <button className="button" style={{marginTop:8}}>Run</button>
      </form>
      <div style={{marginTop:10, maxHeight:180, overflow:"auto", fontSize:12, opacity:.9}}>
        {log.map((l,i)=><div key={i} style={{marginBottom:6}}>{l}</div>)}
      </div>
    </div>
  );
}



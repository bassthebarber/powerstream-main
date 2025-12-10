import React from "react";

const tabBtn = {
  display:"inline-flex", alignItems:"center", gap:8,
  padding:"8px 12px", border:"1px solid #333", borderRadius:10,
  background:"#111", cursor:"pointer"
};
const imgS = { width:22, height:22, objectFit:"contain" };

export default function LogoBar({ page, setPage }) {
  const tabs = [
    { key:"launcher", label:"Launcher",   img:"/logos/powerstream-logo.png" },    // set your true filenames
    { key:"feed",     label:"PowerFeed",  img:"/logos/powerfeedlogo.PNG" },
    { key:"gram",     label:"PowerGram",  img:"/logos/PowerGramLogo.png.PNG" },   // use exact case/name in your folder
    { key:"reel",     label:"PowerReel",  img:"/logos/PowerReelsLogo.png.PNG" }
  ];
  return (
    <div style={{display:"flex", gap:10, alignItems:"center"}}>
      {tabs.map(t => (
        <button key={t.key}
          onClick={() => setPage(t.key)}
          style={{...tabBtn, outline: page===t.key ? "2px solid #ffc107" : "none"}}
          title={t.label}
        >
          <img src={t.img} alt={t.label} style={imgS}/>
          <span>{t.label}</span>
        </button>
      ))}
      <div style={{marginLeft:"auto", opacity:.7, fontSize:13}}>
        API: {import.meta.env.VITE_API_BASE}
      </div>
    </div>
  );
}



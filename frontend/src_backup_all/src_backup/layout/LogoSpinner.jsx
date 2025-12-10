import { useRef, useState } from "react";

export default function LogoSpinner(){
  const audioRef = useRef(null);
  const [playing,setPlaying] = useState(false);

  function toggleAudio(){
    try{
      if(!audioRef.current){ audioRef.current = new Audio("/audio/welcome.mp3"); }
      if(playing){ audioRef.current.pause(); setPlaying(false); }
      else{ audioRef.current.currentTime = 0; audioRef.current.play(); setPlaying(true);
            audioRef.current.onended = ()=>setPlaying(false); }
    }catch(e){ console.warn(e); }
  }

  return (
    <div style={{display:"grid",placeItems:"center",gap:10}}>
      <img className="ps-spinner" src="/logos/powerstream-logo.png" alt="PowerStream" width="200" height="200" />
      <button onClick={toggleAudio}
        style={{padding:"6px 12px",borderRadius:10,border:"1px solid #243041",background:"transparent",color:"#E9EEF5"}}>
        {playing ? " Pause welcome" : " Play welcome"}
      </button>
    </div>
  );
}



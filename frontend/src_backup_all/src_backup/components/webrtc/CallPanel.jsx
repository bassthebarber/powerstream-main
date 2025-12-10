import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const ice = { iceServers:[{ urls:"stun:stun.l.google.com:19302" }] };

export default function CallPanel(){
  const [room,setRoom] = useState("lobby");
  const [joined,setJoined] = useState(false);
  const localRef = useRef(null), remoteRef = useRef(null), pcRef = useRef(null), sockRef = useRef(null);

  useEffect(()=>()=>{ sockRef.current?.disconnect(); pcRef.current?.close(); },[]);

  const join = async()=>{
    sockRef.current = io(import.meta.env.VITE_SOCKET_URL, { path: import.meta.env.VITE_SOCKET_PATH || "/socket.io" });
    await new Promise(r=>sockRef.current.on("connect", r));
    sockRef.current.emit("join", room);
    sockRef.current.on("signal", async ({desc,cand})=>{
      if(desc){
        if(desc.type === "offer"){
          await pcRef.current.setRemoteDescription(desc);
          const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
          stream.getTracks().forEach(t=>pcRef.current.addTrack(t, stream));
          localRef.current.srcObject = stream;
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          sockRef.current.emit("signal", { room, desc: pcRef.current.localDescription });
        }else if(desc.type === "answer"){
          await pcRef.current.setRemoteDescription(desc);
        }
      }else if(cand){
        await pcRef.current.addIceCandidate(cand);
      }
    });

    pcRef.current = new RTCPeerConnection(ice);
    pcRef.current.ontrack = e => { remoteRef.current.srcObject = e.streams[0]; };
    pcRef.current.onicecandidate = e => e.candidate && sockRef.current.emit("signal", { room, cand: e.candidate });

    setJoined(true);
  };

  const call = async()=>{
    const stream = await navigator.mediaDevices.getUserMedia({audio:true, video:true});
    stream.getTracks().forEach(t=>pcRef.current.addTrack(t, stream));
    localRef.current.srcObject = stream;
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    sockRef.current.emit("signal", { room, desc: pcRef.current.localDescription });
  };

  const leave = ()=>{
    pcRef.current?.close(); pcRef.current = null;
    sockRef.current?.disconnect(); sockRef.current = null;
    setJoined(false);
    if(localRef.current?.srcObject){ localRef.current.srcObject.getTracks().forEach(t=>t.stop()); }
  };

  return (
    <div style={{background:"var(--card)",border:"1px solid #222",borderRadius:12,padding:12}}>
      <h3 style={{marginTop:0}}>Call Panel</h3>
      <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
        <input value={room} onChange={e=>setRoom(e.target.value)} placeholder="room-id"/>
        {!joined ? <button onClick={join}>Join</button> : <>
          <button onClick={call}>Call</button>
          <button onClick={leave}>Leave</button>
        </>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
        <video autoPlay muted playsInline ref={localRef} style={{width:"100%",background:"#000",borderRadius:8}}/>
        <video autoPlay playsInline ref={remoteRef} style={{width:"100%",background:"#000",borderRadius:8}}/>
      </div>
    </div>
  );
}



import React, { useState } from "react";

export default function Feed(){
  const [text,setText] = useState("");
  const [posts,setPosts] = useState([
    { id: 1, user:"User", time:new Date().toLocaleString(), text:"Welcome to PowerFeed!" }
  ]);

  const post = () => {
    if(!text.trim()) return;
    setPosts([{ id: Date.now(), user:"User", time:new Date().toLocaleString(), text: text.trim() }, ...posts]);
    setText("");
  };

  return (
    <main className="page">
      <h1>PowerFeed</h1>

      <div className="story-rail">
        {[...Array(7)].map((_,i)=>(<div key={i} className="story">Story</div>))}
      </div>

      <div className="card">
        <textarea className="input" rows={3} placeholder="What's on your mind?"
          value={text} onChange={e=>setText(e.target.value)} />
        <div style={{display:"flex",justifyContent:"flex-end",marginTop:8}}>
          <button className="btn" disabled={!text.trim()} onClick={post}>Post</button>
        </div>
      </div>

      {posts.map(p=>(
        <article key={p.id} className="post">
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:36,height:36,borderRadius:"50%",border:"1px solid var(--line)"}} />
            <div>
              <div style={{fontWeight:600}}>{p.user}</div>
              <div style={{opacity:.7,fontSize:12}}>{p.time}</div>
            </div>
          </div>
          <div style={{marginTop:10,whiteSpace:"pre-wrap"}}>{p.text}</div>
        </article>
      ))}

      <img className="watermark" src="/logos/powerfeed.svg" alt="" />
    </main>
  );
}

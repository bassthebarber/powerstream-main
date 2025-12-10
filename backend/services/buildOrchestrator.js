import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- helper: ensure a file exists with content (self-heal) --------------
async function ensureFile(absPath, content) {
  await fs.promises.mkdir(path.dirname(absPath), { recursive: true });
  if (!fs.existsSync(absPath)) {
    await fs.promises.writeFile(absPath, content, "utf8");
    return { created: true, path: absPath };
  }
  return { created: false, path: absPath };
}

// --- minimal models used by builders -------------------------------------
let SocialPostModel;
try {
  // prefer your real model if present
  SocialPostModel = (await import("../models/SocialPost.js")).default;
} catch {
  // fallback temp model so build never fails
  const schema = new mongoose.Schema({
    text: String,
    mediaUrl: String,
    mediaType: String,
    userId: String,
    likes: [{ userId: String, createdAt: Date }],
    comments: [{ userId: String, text: String, createdAt: Date }],
  }, { timestamps: true });
  SocialPostModel = mongoose.models.SocialPost || mongoose.model("SocialPost", schema);
}

// --- builders --------------------------------------------------------------
async function buildPowerFeed() {
  // guarantee frontend pages exist
  const base = path.resolve(__dirname, "../../frontend/src/pages");
  await ensureFile(
    path.join(base, "PowerFeed.jsx"),
    `import React from "react";
import { useEffect, useState } from "react";
export default function PowerFeed(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{ fetch(import.meta.env.VITE_API_BASE + "/social/posts")
    .then(r=>r.json()).then(d=>setPosts(d.posts||[])).catch(()=>{}); },[]);
  return <div style={{padding:16}}>
    <h2>PowerFeed</h2>
    {posts.map(p=><div key={p._id} style={{padding:"12px 0",borderBottom:"1px solid #333"}}>
      <div style={{opacity:.8}}>{new Date(p.createdAt).toLocaleString()}</div>
      <div style={{fontSize:18}}>{p.text}</div>
      {p.mediaUrl && <img src={p.mediaUrl} alt="" style={{maxWidth:420, borderRadius:8, marginTop:8}}/>}
    </div>)}
  </div>;
}`
  );
  return { ok: true, message: "PowerFeed page ensured" };
}

async function buildPowerGram() {
  const base = path.resolve(__dirname, "../../frontend/src/pages");
  await ensureFile(
    path.join(base, "PowerGram.jsx"),
    `import React,{useEffect,useState} from "react";
export default function PowerGram(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{ fetch(import.meta.env.VITE_API_BASE + "/social/posts")
    .then(r=>r.json()).then(d=>setPosts(d.posts||[])); },[]);
  return <div style={{padding:16}}>
    <h2>PowerGram</h2>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,200px)",gap:12}}>
      {posts.map(p=><div key={p._id} style={{border:"1px solid #333",borderRadius:12,overflow:"hidden"}}>
        {p.mediaUrl ? <img src={p.mediaUrl} alt="" style={{width:"100%",height:200,objectFit:"cover"}}/> :
          <div style={{height:200,display:"grid",placeItems:"center"}}>no media</div>}
        <div style={{padding:8,fontSize:14}}>{p.text}</div>
      </div>)}
    </div>
  </div>;
}`
  );
  return { ok: true, message: "PowerGram page ensured" };
}

async function buildPowerReel() {
  const base = path.resolve(__dirname, "../../frontend/src/pages");
  await ensureFile(
    path.join(base, "PowerReel.jsx"),
    `import React,{useEffect,useState} from "react";
export default function PowerReel(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{ fetch(import.meta.env.VITE_API_BASE + "/social/posts")
    .then(r=>r.json()).then(d=>setPosts(d.posts||[])); },[]);
  return <div style={{padding:16}}>
    <h2>PowerReel</h2>
    {posts.map(p=><div key={p._id} style={{marginBottom:16}}>
      {p.mediaUrl?.endsWith(".m3u8") ? <video src={p.mediaUrl} controls style={{maxWidth:420}}/> :
        p.mediaUrl ? <img src={p.mediaUrl} alt="" style={{maxWidth:420}}/> : null}
      <div style={{fontSize:16, marginTop:6}}>{p.text}</div>
    </div>)}
  </div>;
}`
  );
  return { ok: true, message: "PowerReel page ensured" };
}

async function seedIfEmpty() {
  const count = await SocialPostModel.countDocuments();
  if (count > 0) return { ok: true, seeded: false, count };
  await SocialPostModel.create([
    { text: "Hello PowerStream!", mediaUrl: "", mediaType: "text", userId: "owner@powerstream.local" },
    { text: "Second post 📸", mediaUrl: "", mediaType: "text", userId: "owner@powerstream.local" },
  ]);
  return { ok: true, seeded: true, count: 2 };
}

// --- route verifier (auto-mount safety net) -------------------------------
async function verifyRoutes(app) {
  // optional: if you want Copilot to be able to mount routes at runtime
  // but since you already mount in MasterCircuitBoard, we just return ok
  return { ok: true, mounted: true };
}

// --- command entry ---------------------------------------------------------
export async function runBuild(command, args = {}) {
  const cmd = String(command).trim().toLowerCase();

  if (cmd === "health") return { ok: true, accepted: false, message: "copilot alive" };

  if (cmd === "build powerfeed") {
    const a = await buildPowerFeed();
    const s = await seedIfEmpty();
    return { ok: true, accepted: true, step: "powerfeed", a, s };
  }

  if (cmd === "build powergram") {
    const a = await buildPowerGram();
    const s = await seedIfEmpty();
    return { ok: true, accepted: true, step: "powergram", a, s };
  }

  if (cmd === "build powerreel") {
    const a = await buildPowerReel();
    const s = await seedIfEmpty();
    return { ok: true, accepted: true, step: "powerreel", a, s };
  }

  if (cmd === "build all" || cmd === "auto layout full system") {
    const f = await buildPowerFeed();
    const g = await buildPowerGram();
    const r = await buildPowerReel();
    const s = await seedIfEmpty();
    return { ok: true, accepted: true, step: "all", f, g, r, s };
  }

  // repair mode can add other self-heals you want
  if (cmd === "repair") {
    const base = path.resolve(__dirname, "../../frontend/public/logos");
    await ensureFile(path.join(base, "powerfeed.svg"), `<svg xmlns="http://www.w3.org/2000/svg"/>`);
    await ensureFile(path.join(base, "powergram.svg"), `<svg xmlns="http://www.w3.org/2000/svg"/>`);
    await ensureFile(path.join(base, "powerreel.svg"), `<svg xmlns="http://www.w3.org/2000/svg"/>`);
    return { ok: true, accepted: true, repaired: true };
  }

  return { ok: false, accepted: false, message: `Unknown command: ${command}` };
}

// src/pages/FilmUpload.jsx
import React, { useState, useRef } from "react";

const API_URL = "https://livepeer.studio/api";
const API_KEY = import.meta.env.VITE_LIVEPEER_API_KEY;

// (Optional) Supabase – only used if you have this file/path.
// If you don't, you can safely delete the import + saveToSupabase() calls.
let supabase;
try {
  supabase = (await import("../supabaseClient")).default;
} catch (_) {
  supabase = null;
}

async function requestUploadUrl(name) {
  const res = await fetch(`${API_URL}/asset/request-upload`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, storage: { ipfs: true } }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Livepeer request-upload failed: ${res.status} ${t}`);
  }
  return res.json(); // { asset, task, url, tusEndpoint? }
}

async function getAsset(assetId) {
  const res = await fetch(`${API_URL}/asset/${assetId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Livepeer getAsset failed: ${res.status} ${t}`);
  }
  return res.json();
}

export default function FilmUpload() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [playbackId, setPlaybackId] = useState("");
  const [assetId, setAssetId] = useState("");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const onPick = (e) => {
    setFile(e.target.files?.[0] || null);
    setStatus("");
    setPlaybackId("");
    setAssetId("");
  };

  const upload = async () => {
    try {
      if (!file) {
        setStatus("Pick a video file first.");
        return;
      }
      if (!API_KEY) {
        setStatus("Missing VITE_LIVEPEER_API_KEY in .env.local");
        return;
      }

      setStatus("Requesting upload URL…");
      const { asset, url } = await requestUploadUrl(file.name);
      setAssetId(asset?.id || "");
      if (!url) throw new Error("No upload URL returned.");

      setStatus("Uploading to Livepeer… (do not close)");
      const put = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": file.type || "video/mp4" },
        body: file,
      });
      if (!put.ok) {
        const t = await put.text();
        throw new Error(`Upload failed: ${put.status} ${t}`);
      }

      setStatus("Uploaded! Waiting for processing (polling) …");

      // Poll asset until playbackId is ready
      const playback = await waitForPlaybackId(asset.id, 60_000);
      setPlaybackId(playback);
      setStatus("Ready to play!");

      // Optional: save to Supabase
      if (supabase) {
        setSaving(true);
        await saveToSupabase({
          asset_id: asset.id,
          playback_id: playback,
          title: file.name,
        });
        setSaving(false);
      }
    } catch (err) {
      console.error(err);
      setStatus(err.message || "Upload error");
    }
  };

  async function waitForPlaybackId(id, timeoutMs = 60000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const a = await getAsset(id);
      if (a?.playbackId) return a.playbackId;
      await new Promise((r) => setTimeout(r, 2000));
    }
    throw new Error("Timed out waiting for playbackId.");
  }

  async function saveToSupabase(row) {
    // Make sure you have a table like:
    // create table if not exists public.film_rolls (
    //   id uuid primary key default gen_random_uuid(),
    //   title text,
    //   asset_id text,
    //   playback_id text,
    //   created_at timestamptz default now()
    // );
    const { error } = await supabase
      .from("film_rolls")
      .insert([{ title: row.title, asset_id: row.asset_id, playback_id: row.playback_id }]);
    if (error) throw error;
  }

  const copy = async (txt) => {
    try {
      await navigator.clipboard.writeText(txt);
      setStatus("Copied to clipboard.");
    } catch {
      setStatus("Copy failed (clipboard permissions).");
    }
  };

  const box = {
    maxWidth: 720,
    margin: "40px auto",
    padding: 16,
    border: "1px solid rgba(255,179,77,.35)",
    borderRadius: 12,
    background: "rgba(0,0,0,.4)",
    color: "#ffb34d",
  };

  return (
    <div style={box}>
      <h2 style={{ marginTop: 0, color: "#ffb34d" }}>Upload a Film (VOD)</h2>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        onChange={onPick}
        style={{ margin: "12px 0", color: "#ddd" }}
      />

      <div style={{ display: "flex", gap: 12, margin: "12px 0" }}>
        <button onClick={upload} style={btn}>
          Upload to Livepeer
        </button>
        <button
          onClick={() => {
            inputRef.current?.value && (inputRef.current.value = "");
            setFile(null);
            setStatus("");
            setPlaybackId("");
            setAssetId("");
          }}
          style={btnGhost}
        >
          Reset
        </button>
      </div>

      {status && <p style={{ color: "#ddd" }}>{status}{saving ? " (saving to library…)" : ""}</p>}

      {assetId && (
        <p style={{ color: "#aaa" }}>
          Asset ID: <code style={code}>{assetId}</code>{" "}
          <button onClick={() => copy(assetId)} style={mini}>copy</button>
        </p>
      )}

      {playbackId && (
        <div style={{ marginTop: 12 }}>
          <p style={{ color: "#ddd" }}>
            Playback ID: <code style={code}>{playbackId}</code>{" "}
            <button onClick={() => copy(playbackId)} style={mini}>copy</button>
          </p>
          <p style={{ color: "#aaa" }}>
            HLS URL:{" "}
            <code style={code}>
              https://lp-playback.com/hls/{playbackId}/index.m3u8
            </code>
          </p>
          <p style={{ color: "#aaa" }}>
            MP4 (Progressive):{" "}
            <code style={code}>
              https://lp-playback.com/progressive/{playbackId}/video
            </code>
          </p>
        </div>
      )}
    </div>
  );
}

const btn = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #ffb34d",
  background: "transparent",
  color: "#ffb34d",
  cursor: "pointer",
};

const btnGhost = {
  ...btn,
  borderColor: "rgba(255,255,255,.25)",
  color: "#ddd",
};

const mini = {
  padding: "2px 6px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,.25)",
  background: "transparent",
  color: "#ddd",
  cursor: "pointer",
  marginLeft: 8,
};

const code = {
  background: "rgba(255,255,255,.08)",
  padding: "2px 6px",
  borderRadius: 6,
  color: "#fff",
};



import React, { useState } from "react";
import s from "../../styles/Gram.module.css";

export default function UploadImage({ onDone }) {
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!imageUrl) return;
    setBusy(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/gram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption, image_url: imageUrl })
      });
      if (!res.ok) throw new Error(await res.text());
      setImageUrl(""); setCaption("");
      onDone && onDone();
    } catch (e2) {
      alert("Upload failed: " + e2.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={s.row}>
      <input className={s.input} placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
      <input className={s.input} placeholder="Caption" value={caption} onChange={e => setCaption(e.target.value)} />
      <button className={s.btn} disabled={busy}>{busy ? "Saving…" : "Post"}</button>
    </form>
  );
}



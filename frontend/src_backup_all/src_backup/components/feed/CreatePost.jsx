import React, { useState } from "react";
import supabase from "../../lib/supabaseClient.jsx";

const BUCKET = import.meta.env.VITE_SOCIAL_BUCKET || "social";

export default function CreatePost() {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      // Who is the user?
      const { data: { user }, error: uerr } = await supabase.auth.getUser();
      if (uerr) throw uerr;
      if (!user) throw new Error("You must be signed in to post.");

      let media_url = null;

      // Optional file upload to Storage
      if (file) {
        const ext = file.name.split(".").pop();
        const path = `feed/${user.id}/${Date.now()}.${ext}`;

        const { error: uploadErr } = await supabase.storage
          .from(BUCKET)
          .upload(path, file, { upsert: false });

        if (uploadErr) throw uploadErr;

        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
        media_url = pub?.publicUrl || null;
      }

      // Insert post
      const { error: insErr } = await supabase
        .from("feed")
        .insert([{ user_id: user.id, content: text.trim(), media_url }]);

      if (insErr) throw insErr;

      setText("");
      setFile(null);
    } catch (err) {
      setError(err.message || "Failed to post.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 12, background: "var(--card, #101010)", border: "1px solid #222", borderRadius: 12 }}>
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        style={{ width: "100%", background: "black", color: "gold", border: "1px solid #333", borderRadius: 8, padding: 8 }}
      />
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 8 }}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button disabled={busy || !text.trim()} style={{ padding: "8px 14px", borderRadius: 8 }}>
          {busy ? "Posting..." : "Post"}
        </button>
      </div>
      {error && <p style={{ color: "salmon", marginTop: 8 }}>{error}</p>}
    </form>
  );
}



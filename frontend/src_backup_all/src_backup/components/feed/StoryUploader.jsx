import React, { useRef, useState } from "react";
import css from "../../styles/Feed.module.css";
import { uploadStoryFile } from "../../services/stories";

export default function StoryUploader({ onUploaded }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  async function pick(e){
    const file = e.target.files?.[0]; if(!file) return;
    setBusy(true);
    try { await uploadStoryFile(file, "You"); onUploaded?.(); }
    catch (err) { console.error(err); alert("Upload failed"); }
    finally { setBusy(false); e.target.value = ""; }
  }

  return (
    <>
      <button className={css.storyUploadBtn} disabled={busy} onClick={()=>input.current?.click()}>
        {busy ? "Uploading…" : "Be creative"}
      </button>
      <input ref={input} type="file" accept="image/*,video/*" hidden onChange={pick}/>
    </>
  );
}



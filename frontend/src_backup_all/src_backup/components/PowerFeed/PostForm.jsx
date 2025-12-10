import { useState } from "react";
export default function PostForm({ onPost }) {
  const [text,setText] = useState("");
  return (
    <form
      onSubmit={e=>{ e.preventDefault(); if(!text.trim()) return; onPost?.({ id:Date.now(), text }); setText(""); }}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4"
    >
      <textarea
        value={text}
        onChange={e=>setText(e.target.value)}
        rows={3}
        placeholder="Share something..."
        className="w-full resize-none rounded-xl bg-black p-3 text-sm text-zinc-200 outline-none ring-1 ring-zinc-800 focus:ring-powergold"
      />
      <div className="mt-3 flex justify-end">
        <button className="rounded-xl bg-powergold px-4 py-2 text-black">Post to PowerFeed</button>
      </div>
    </form>
  );
}



export default function BeCreativeBar() {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-800" />
        <input
          placeholder="What's going on in your world?"
          className="flex-1 rounded-xl bg-black px-4 py-2 text-sm text-powergold outline-none ring-1 ring-zinc-800"
        />
      </div>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <button className="rounded-xl border border-zinc-800 px-3 py-2">Post</button>
        <button className="rounded-xl border border-zinc-800 px-3 py-2">Story</button>
        <button className="rounded-xl border border-zinc-800 px-3 py-2">Live</button>
      </div>
    </div>
  );
}



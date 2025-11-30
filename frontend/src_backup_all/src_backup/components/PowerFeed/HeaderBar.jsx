export default function HeaderBar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <img src="/powerfeedlogo.png" alt="PowerFeed" className="h-8 w-8" />
          <span className="text-lg font-semibold text-powergold">PowerFeed</span>
        </div>
        <div className="hidden md:block w-1/2">
          <input
            placeholder="Ask PowerFeed or Search"
            className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm outline-none ring-1 ring-zinc-800 focus:ring-powergold"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-xl border border-powergold px-3 py-1 text-powergold">+</button>
          <a href="/chat" title="PowerLine" className="rounded-xl border border-zinc-700 px-3 py-1">?</a>
        </div>
      </div>
    </header>
  );
}



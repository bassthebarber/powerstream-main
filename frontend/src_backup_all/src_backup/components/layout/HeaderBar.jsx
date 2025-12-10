export default function HeaderBar(){
  return (
    <header className="w-full border-b border-yellow-500/30 bg-black/80 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-2xl font-bold tracking-wide">PowerStream</div>
        <nav className="flex gap-4 text-sm">
          <a href="/powerfeed">PowerFeed</a>
          <a href="/powerline">PowerLine</a>
          <a href="/powergram">PowerGram</a>
          <a href="/powerreel">PowerReel</a>
          <a href="/tv">Stations</a>
        </nav>
      </div>
    </header>
  )
}

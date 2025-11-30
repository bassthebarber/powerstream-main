export default function StoryBar() {
  const stories = Array.from({ length: 8 }).map((_, i) => ({ id: i, name: `User ${i+1}` }));
  return (
    <div className="no-scrollbar flex gap-3 overflow-x-auto py-3">
      {stories.map(s => (
        <div key={s.id} className="min-w-28">
          <div className="h-40 w-28 rounded-2xl bg-zinc-900 ring-1 ring-zinc-800" />
          <p className="mt-1 text-center text-xs text-zinc-300">{s.name}</p>
        </div>
      ))}
    </div>
  );
}



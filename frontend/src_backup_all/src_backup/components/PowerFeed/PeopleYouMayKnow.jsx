export default function PeopleYouMayKnow() {
  const people = Array.from({ length: 6 }).map((_,i)=>({id:i,name:`Creator ${i+1}`}));
  return (
    <aside className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
      <h3 className="mb-3 text-sm font-semibold text-powergold">People You May Know</h3>
      <div className="space-y-3">
        {people.map(p=>(
          <div key={p.id} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-zinc-800" />
              <span className="text-sm">{p.name}</span>
            </div>
            <button className="rounded-lg border border-zinc-700 px-2 py-1 text-xs">Add</button>
          </div>
        ))}
      </div>
    </aside>
  );
}



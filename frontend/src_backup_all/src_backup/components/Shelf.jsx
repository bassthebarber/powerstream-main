import React from "react";
import { Link } from "react-router-dom";

export default function Shelf({ title, items=[] }) {
  return (
    <section className="card" style={{marginTop:12}}>
      <h2 style={{marginBottom:8}}>{title}</h2>
      <div className="shelf">
        {items.map(it => (
          <Link key={it.id} to={it.href || "#"} className="tile">
            <img className="poster" src={it.poster} alt={it.title}/>
            <h4 title={it.title}>{it.title}</h4>
          </Link>
        ))}
        {!items.length ? <div style={{opacity:.7}}>Nothing here yet.</div> : null}
      </div>
    </section>
  );
}



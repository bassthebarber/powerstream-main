// src/components/ui/Shelf.jsx
export default function Shelf({ title, items = [], renderCard }) {
  return (
    <section className="shelf">
      <div className="shelf-head">
        <h3 className="section-title">{title}</h3>
      </div>
      <div className="shelf-row">
        {items.map((it, i) => (
          <div key={it.id ?? i} className="shelf-cell">
            {renderCard(it)}
          </div>
        ))}
      </div>
    </section>
  );
}



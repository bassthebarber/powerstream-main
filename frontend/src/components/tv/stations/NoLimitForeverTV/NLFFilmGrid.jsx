// frontend/src/components/tv/stations/NoLimitForeverTV/NLFFilmGrid.jsx
// No Limit Forever TV - Film Grid

import NLFFilmCard from "./NLFFilmCard";

export default function NLFFilmGrid({ films, emptyMessage, onDelete, showDelete = true }) {
  if (!films || films.length === 0) {
    return (
      <div className="nlf-empty">
        <div className="nlf-empty-icon">🎬</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="nlf-grid">
      {films.map((film) => (
        <NLFFilmCard 
          key={film._id} 
          film={film} 
          onDelete={onDelete}
          showDelete={showDelete}
        />
      ))}
    </div>
  );
}


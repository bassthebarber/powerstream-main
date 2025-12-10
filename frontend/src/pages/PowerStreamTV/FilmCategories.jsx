import React from "react";

export default function FilmCategories({ categories, active, onChange }) {
  if (!categories || !categories.length) return null;

  return (
    <div className="ps-tv-categories">
      {categories.map((cat) => {
        const id = cat.id || cat.slug || cat._id;
        const label = cat.label || cat.name;
        const isActive = id === active;

        return (
          <button
            key={id}
            type="button"
            className={`ps-tv-category ${isActive ? "active" : ""}`}
            onClick={() => onChange(id)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

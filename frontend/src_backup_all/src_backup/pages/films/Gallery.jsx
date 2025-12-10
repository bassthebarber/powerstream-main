// src/pages/films/Gallery.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Gallery() {
  const films = [
    {
      id: 1,
      title: "Sample Film",
      thumbnail: "/logos/powerstream-logo.png",
      description: "Independent filmmaker demo.",
    },
    {
      id: 2,
      title: "Podcast Example",
      thumbnail: "/logos/PowerGramlogo.png",
      description: "A featured podcast stream.",
    },
  ];

  return (
    <main className="page">
      <h1>🎬 PowerStream Film Gallery</h1>
      <div className="grid-cards">
        {films.map(film => (
          <Link to={`/films/${film.id}`} key={film.id} className="card">
            <img
              src={film.thumbnail}
              alt={film.title}
              style={{ maxWidth: "200px", borderRadius: "12px" }}
            />
            <h3>{film.title}</h3>
            <p>{film.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}



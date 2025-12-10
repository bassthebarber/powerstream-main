// src/pages/films/FilmDetail.jsx
import React from "react";
import { useParams } from "react-router-dom";

export default function FilmDetail() {
  const { id } = useParams();

  return (
    <main className="page">
      <h1>Film #{id}</h1>
      <p>This is the detail page for film {id}. Later you can embed HLS player here.</p>
    </main>
  );
}



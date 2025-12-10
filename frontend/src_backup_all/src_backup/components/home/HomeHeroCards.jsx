import React from "react";
import homeCards from "../../data/homecards.json"; // adjust path if needed
import "./HomeHeroCards.css"; // keep your styling

export default function HomeHeroCards() {
  return (
    <div className="home-cards">
      {homeCards.map((card) => (
        <a key={card.slug} href={`/${card.slug}`} className="home-card">
          <img src={card.logo} alt={card.title} className="home-card-logo" />
          <h3>{card.title}</h3>
          <p>{card.blurb}</p>
        </a>
      ))}
    </div>
  );
}



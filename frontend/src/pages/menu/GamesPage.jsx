// frontend/src/pages/menu/GamesPage.jsx
import React from "react";
import MenuPageLayout from "./MenuPageLayout.jsx";

export default function GamesPage() {
  const mockGames = [
    { id: 1, name: "Beat Battle", icon: "🥁", players: "2-8", description: "Compete in making beats" },
    { id: 2, name: "Lyric Challenge", icon: "📝", players: "1+", description: "Test your music knowledge" },
    { id: 3, name: "Name That Tune", icon: "🎵", players: "2+", description: "Guess songs from clips" },
    { id: 4, name: "Studio Trivia", icon: "🎛️", players: "1+", description: "Audio engineering quiz" },
  ];

  return (
    <MenuPageLayout
      icon="🎮"
      title="Games"
      subtitle="Play music games with friends"
    >
      <div className="games-coming-soon">
        <div className="games-banner">
          <span className="games-banner-icon">🎮</span>
          <h2>Games Coming Soon!</h2>
          <p>Music games and challenges are being developed. Stay tuned!</p>
        </div>
      </div>

      <h3 className="games-section-title">Preview</h3>
      <div className="ps-menu-grid">
        {mockGames.map((game) => (
          <div key={game.id} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h3>{game.name}</h3>
            <p>{game.description}</p>
            <span className="game-players">👥 {game.players} players</span>
            <button className="ps-menu-btn ps-menu-btn--secondary" disabled>
              Coming Soon
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .games-coming-soon {
          margin-bottom: 32px;
        }

        .games-banner {
          background: linear-gradient(135deg, rgba(230,184,0,0.15), rgba(230,184,0,0.05));
          border: 1px solid rgba(230,184,0,0.2);
          border-radius: 16px;
          padding: 40px;
          text-align: center;
        }

        .games-banner-icon {
          font-size: 60px;
          display: block;
          margin-bottom: 16px;
        }

        .games-banner h2 {
          font-size: 24px;
          font-weight: 800;
          color: var(--gold);
          margin: 0 0 8px 0;
        }

        .games-banner p {
          color: var(--muted);
          margin: 0;
        }

        .games-section-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: var(--muted);
        }

        .game-card {
          background: linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
        }

        .game-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .game-card h3 {
          font-size: 18px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .game-card p {
          font-size: 14px;
          color: var(--muted);
          margin: 0 0 12px 0;
        }

        .game-players {
          display: block;
          font-size: 12px;
          color: var(--gold);
          margin-bottom: 16px;
        }

        .game-card button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </MenuPageLayout>
  );
}



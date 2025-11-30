// frontend/src/components/suggestions/GenreMatchPanel.jsx

import React, { useState } from 'react';

export default function GenreMatchPanel() {
  const [selectedGenre, setSelectedGenre] = useState('');
  const [suggestedMatches, setSuggestedMatches] = useState([]);

  const genres = ['Hip Hop', 'Trap', 'R&B', 'Afrobeat', 'Pop', 'Latin', 'Country', 'Rock'];

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);

    // Simulated AI match logic (in production you'd fetch from backend AI)
    const matches = [
      `🎵 ${e.target.value} beat with 808s`,
      `🔥 ${e.target.value} freestyle-ready instrumental`,
      `🎧 ${e.target.value} slow tempo melodic track`,
    ];
    setSuggestedMatches(matches);
  };

  return (
    <div className="genre-match-panel">
      <h2>🎯 Genre Match Panel</h2>
      <label>Select Genre for AI Beat Suggestions:</label>
      <select value={selectedGenre} onChange={handleGenreChange}>
        <option value="">-- Choose a genre --</option>
        {genres.map((genre, index) => (
          <option key={index} value={genre}>{genre}</option>
        ))}
      </select>

      {suggestedMatches.length > 0 && (
        <div className="suggestions">
          <h3>Suggested Beats:</h3>
          <ul>
            {suggestedMatches.map((match, index) => (
              <li key={index}>{match}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

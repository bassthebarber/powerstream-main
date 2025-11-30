import React, { useEffect, useState } from 'react';

const VotingPanel = () => {
  const [candidates, setCandidates] = useState([]);
  const [vote, setVote] = useState('');

  useEffect(() => {
    fetch('/api/tgt/candidates')
      .then((res) => res.json())
      .then(setCandidates);
  }, []);

  const handleVote = async () => {
    if (!vote) {
      alert('Choose a candidate to vote for');
      return;
    }

    try {
      const res = await fetch('/api/tgt/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate: vote }),
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) {
      console.error(err);
      alert('Vote failed');
    }
  };

  return (
    <div className="voting-panel">
      <h3>🗳️ Vote for Your Favorite</h3>
      <select onChange={(e) => setVote(e.target.value)} value={vote}>
        <option value="">Select candidate</option>
        {candidates.map((cand) => (
          <option key={cand.id} value={cand.id}>
            {cand.name}
          </option>
        ))}
      </select>
      <button onClick={handleVote}>Vote</button>
    </div>
  );
};

export default VotingPanel;

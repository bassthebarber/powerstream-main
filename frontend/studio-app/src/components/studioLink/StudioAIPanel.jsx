import React, { useState } from 'react';

const StudioAIPanel = () => {
  const [query, setQuery] = useState('');
  const [responses, setResponses] = useState([
    { from: 'AI', text: 'Hello engineer, ready to assist in your mix!' }
  ]);

  const handleAskAI = async () => {
    if (!query.trim()) return;
    setResponses([...responses, { from: 'You', text: query }]);
    // Placeholder AI simulation
    setTimeout(() => {
      setResponses(prev => [...prev, { from: 'AI', text: `AI Response to "${query}"` }]);
    }, 1000);
    setQuery('');
  };

  return (
    <div className="studioPanel ai-panel">
      <h2>🤖 AI Assistant</h2>
      <div className="ai-window">
        {responses.map((msg, i) => (
          <div key={i} className={`ai-msg ${msg.from === 'You' ? 'user' : 'ai'}`}>
            <strong>{msg.from}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="ai-input">
        <input
          type="text"
          placeholder="Ask AI something..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
        />
        <button onClick={handleAskAI}>Send</button>
      </div>
    </div>
  );
};

export default StudioAIPanel;

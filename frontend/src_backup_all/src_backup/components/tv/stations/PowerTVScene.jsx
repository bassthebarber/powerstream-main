import React from 'react';

const PowerTVScene = () => (
  <div className="power-tv-scene">
    <h2>📡 Power TV Scene</h2>
    <p>Live broadcast environment for this station.</p>
    <iframe
      title="Live Stream"
      src="https://livepeer.studio/player/teststream"
      width="100%"
      height="480"
      style={{ border: "1px solid #333", borderRadius: 6 }}
    />
  </div>
);

export default PowerTVScene;



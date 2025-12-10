// TVSyncPanel.jsx
import React, { useState } from 'react';


export default function TVSyncPanel() {
const [status, setStatus] = useState(null);


const handleSync = async () => {
try {
const res = await fetch('/api/tv/sync', { method: 'POST' });
const data = await res.json();
setStatus(data.message || 'Synced!');
} catch (err) {
setStatus('Error syncing');
}
};


return (
<div className="tv-sync-panel">
<h2>📡 TV AI Sync</h2>
<button onClick={handleSync}>Sync Content with AI</button>
{status && <p>{status}</p>}
</div>
);
}
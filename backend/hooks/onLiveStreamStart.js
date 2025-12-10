// backend/hooks/onLiveStreamStart.js

export async function onLiveStreamStart(stationId) {
  console.log(`📡 Live Stream Started for Station ID: ${stationId}`);
  // Optionally notify users, log to database, or update stream state
}

export default { onLiveStreamStart };

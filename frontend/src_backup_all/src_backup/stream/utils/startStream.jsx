// frontend/utils/startStream.js
export async function startStream(streamConfig) {
  try {
    const res = await fetch(`/api/streams/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(streamConfig),
    });
    return await res.json();
  } catch (err) {
    console.error('Error starting stream:', err);
    return null;
  }
}



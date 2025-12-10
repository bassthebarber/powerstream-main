// frontend/utils/stopStream.js
export async function stopStream(streamId) {
  try {
    const res = await fetch(`/api/streams/${streamId}/stop`, {
      method: 'POST',
    });
    return await res.json();
  } catch (err) {
    console.error('Error stopping stream:', err);
    return null;
  }
}



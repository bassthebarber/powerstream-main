// frontend/utils/fetchStreamData.js
export async function fetchStreamData(streamId) {
  try {
    const res = await fetch(`/api/streams/${streamId}`);
    if (!res.ok) throw new Error('Failed to fetch stream data');
    return await res.json();
  } catch (err) {
    console.error('Error fetching stream data:', err);
    return null;
  }
}



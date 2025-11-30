// frontend/utils/sendStreamMessage.js
export async function sendStreamMessage(streamId, message) {
  try {
    const res = await fetch(`/api/streams/${streamId}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    return await res.json();
  } catch (err) {
    console.error('Error sending message:', err);
    return null;
  }
}



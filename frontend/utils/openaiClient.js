// /frontend/utils/openaiClient.js
export const queryOpenAI = async (prompt) => {
  const res = await fetch('/api/openai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  const data = await res.json();
  return data.response;
};

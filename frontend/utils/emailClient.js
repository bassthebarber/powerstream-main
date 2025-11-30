// /frontend/utils/emailClient.js
export const sendContactForm = async ({ name, email, message }) => {
  const res = await fetch('/api/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  });

  return await res.json();
};

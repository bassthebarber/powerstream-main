// frontend/src/utils/sendCommand.js
export async function sendCommand(text) {
  const base = import.meta.env.VITE_API_BASE || process.env.REACT_APP_API_BASE;
  const res = await fetch(`${base.replace(/\/$/, "")}/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: text }),
  });
  return res.json();
}
export async function sendCommand(text) {
  const base = import.meta.env.VITE_API_BASE || process.env.REACT_APP_API_BASE;
  const url = `${base.replace(/\/$/, "")}/command`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: text }),
  });
  return res.json();
}

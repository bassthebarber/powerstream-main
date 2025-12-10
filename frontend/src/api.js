const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.host}`;

// Upload a Blob (audio/webm) to your backend
export async function uploadToStudio(blob, filename = "take.webm") {
  const fd = new FormData();
  fd.append("file", blob, filename);

  const res = await fetch(`${API_URL}/api/studio/upload`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json(); // expect { url: "https://..." }
}

// Trigger a processing job (mix/master/etc.)
export async function runProcess(payload) {
  const res = await fetch(`${API_URL}/api/studio/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Process failed: ${res.status}`);
  return res.json();
}

// src/services/UploadMedia.js
export async function uploadMedia({ file, title, kind = "auto" }) {
  if (!file) throw new Error("No file selected.");

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";
  const url = `${API_BASE}/api/uploads`;

  const form = new FormData();
  form.append("file", file);
  form.append("title", title ?? file.name);
  form.append("kind", kind); // "audio" | "video" | "image" | "auto"

  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upload failed (${res.status}): ${text || res.statusText}`);
  }

  return res.json(); // expect { id, url, ... }
}



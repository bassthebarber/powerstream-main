// src/lib/studioApi.js
import { API_BASE } from "../config";

/**
 * Upload an audio Blob/File
 * @param {File|Blob} fileOrBlob - Audio file or blob
 * @param {string} filename - Default filename if not provided
 * @returns {Promise<{ok:boolean,file:string,url:string}>}
 */
export async function uploadToStudio(fileOrBlob, filename = "take.webm") {
  const form = new FormData();
  form.append("audio", fileOrBlob, filename);

  const response = await fetch(`${API_BASE}/api/studio/upload`, {
    method: "POST",
    body: form,
  });

  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "Upload failed");
  return result; // { ok, file, url }
}

/**
 * List all uploaded studio files
 * @returns {Promise<Array<{name:string,url:string}>>}
 */
export async function listFiles() {
  const response = await fetch(`${API_BASE}/api/studio/files`);
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "List failed");
  return result.files;
}

/**
 * Send an export link via email
 * @param {Object} data - { to, url, subject?, text? }
 * @returns {Promise<{ok:boolean}>}
 */
export async function sendExportEmail({ to, url, subject = "Your Studio Export", text }) {
  const response = await fetch(`${API_BASE}/api/studio/export-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, url, subject, text }),
  });

  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "Email failed");
  return result;
}

/**
 * Trigger automated mix/master process
 * @param {Object} data - { file, operation }
 * @returns {Promise<{ok:boolean}>}
 */
export async function runProcess({ file, operation = "auto-mix" }) {
  const response = await fetch(`${API_BASE}/api/studio/auto-mix`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file, operation }),
  });

  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "Processing failed");
  return result;
}

/**
 * Delete a file from the studio
 * @param {string} filename - file name or id
 * @returns {Promise<{ok:boolean}>}
 */
export async function deleteFile(filename) {
  const response = await fetch(`${API_BASE}/api/studio/files/${filename}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "Delete failed");
  return result;
}

/**
 * Fetch studio statistics (optional)
 * @returns {Promise<{ok:boolean,stats:object}>}
 */
export async function getStudioStats() {
  const response = await fetch(`${API_BASE}/api/studio/stats`);
  const result = await response.json();
  if (!result.ok) throw new Error(result.error || "Stats fetch failed");
  return result.stats;
}

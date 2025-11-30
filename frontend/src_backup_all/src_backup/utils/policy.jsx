// src/utils/policy.js

// LocalStorage keys (single source of truth)
export const KEY_EULA = "ps_eula_accepted";   // "1" when accepted
export const KEY_DOB  = "ps_user_dob";        // YYYY-MM-DD
export const KEY_PCOK = "ps_parent_ok";       // "1" when parent consented

// Change this to 18 if you want stricter gating.
export const MIN_AGE = 13;

// --- EULA helpers ---
export const getEulaAccepted = () => localStorage.getItem(KEY_EULA) === "1";
export const setEulaAccepted = () => localStorage.setItem(KEY_EULA, "1");

// --- Age helpers ---
export function setDobISO(isoStr) {
  // isoStr should be YYYY-MM-DD; validate very lightly
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoStr)) return false;
  localStorage.setItem(KEY_DOB, isoStr);
  return true;
}
export const getDobISO = () => localStorage.getItem(KEY_DOB) || null;

export function calcAge(dobISO) {
  if (!dobISO) return null;
  const d = new Date(dobISO);
  if (isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function isOldEnough() {
  const age = calcAge(getDobISO());
  if (age === null) return null; // unknown
  return age >= MIN_AGE;
}

// --- Parent consent helpers ---
export const getParentConsent = () => localStorage.getItem(KEY_PCOK) === "1";
export const setParentConsent = () => localStorage.setItem(KEY_PCOK, "1");

// Decide where to send user after accepting EULA
export function nextStepAfterEula() {
  const ok = isOldEnough();
  if (ok === true || getParentConsent()) return "/feed";
  return "/age";
}

/**
 * Placeholder for future, *optional* age estimation.
 * DO NOT rely on AI-guessing age for compliance. Keep DOB/consent checks.
 */
export async function aiAgeEstimate(_input) {
  return null; // unknown by default
}



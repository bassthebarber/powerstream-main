// backend/utils/streamKeyGenerator.js
import crypto from "crypto";

export function generateStreamKey(prefix = "psk") {
  const rand = crypto.randomBytes(18).toString("base64url");
  return `${prefix}_${rand}`;
}

// utils/VerifyXXToken.js
import jwtDecode from "jwt-decode";

export default function verifyXXToken(token) {
  try {
    if (!token) return { valid: false, reason: "No token provided" };

    const decoded = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp < now) {
      return { valid: false, reason: "Token expired" };
    }

    return { valid: true, payload: decoded };
  } catch (err) {
    console.error("VerifyXXToken error:", err);
    return { valid: false, reason: "Invalid token" };
  }
}

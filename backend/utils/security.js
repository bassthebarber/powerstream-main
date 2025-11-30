// /backend/configs/security.js
module.exports = {
    jwtSecret: process.env.JWT_SECRET || "super-secret-key",
    encryptionKey: process.env.ENCRYPTION_KEY || "default-encryption",
    rateLimit: { windowMs: 60 * 1000, max: 100 } // 100 requests/min
};

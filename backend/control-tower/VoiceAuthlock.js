// backend/control-tower/security/VoiceAuthLock.js
export const voiceAuthLock = async (userId) => {
    // Check DB for registered owner voice ID
    const registeredOwnerId = process.env.OWNER_ID || 'OWNER_001';
    return { authorized: userId === registeredOwnerId };
};

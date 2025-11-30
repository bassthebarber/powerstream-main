// backend/InfinityCore/security/VoiceAuthLock.js
import fs from 'fs';
import crypto from 'crypto';

let ownerVoiceSignature = null;

// Load stored voice signature (if exists)
if (fs.existsSync('./backend/InfinityCore/security/ownerVoice.sig')) {
    ownerVoiceSignature = fs.readFileSync('./backend/InfinityCore/security/ownerVoice.sig', 'utf8');
}

// Mock AI voice recognition function
function generateVoiceSignature(voiceSample) {
    return crypto.createHash('sha256').update(voiceSample).digest('hex');
}

// Enroll your voice
export function enrollOwnerVoice(voiceSample) {
    const signature = generateVoiceSignature(voiceSample);
    ownerVoiceSignature = signature;
    fs.writeFileSync('./backend/InfinityCore/security/ownerVoice.sig', signature);
    console.log('✅ Owner voice enrolled and saved.');
}

// Verify any command against stored owner voice
export function verifyVoiceAccess(voiceSample) {
    if (!ownerVoiceSignature) return false;
    const sampleSig = generateVoiceSignature(voiceSample);
    return sampleSig === ownerVoiceSignature;
}

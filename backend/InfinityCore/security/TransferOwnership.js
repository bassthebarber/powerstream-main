// backend/InfinityCore/security/TransferOwnership.js
import fs from 'fs';
import { enrollOwnerVoice } from './VoiceAuthLock.js';

// Transfer voice authentication to new owner
export function transferOwnership(newOwnerVoiceSample) {
    enrollOwnerVoice(newOwnerVoiceSample);
    console.log('🔄 Ownership successfully transferred to new voice.');
    fs.writeFileSync('./backend/InfinityCore/security/ownershipTransfer.log',
        `Transferred to new owner at: ${new Date().toISOString()}\n`);
}

// /backend/AI/InfinityStatus.js
const InfinityCore = require('./InfinityCore/InfinityCore');

class InfinityStatus {
    static getStatus() {
        return {
            active: InfinityCore.isActive(),
            timestamp: Date.now()
        };
    }
}

module.exports = InfinityStatus;

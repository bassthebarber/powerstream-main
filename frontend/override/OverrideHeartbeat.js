// /override/OverrideHeartbeat.js
let heartbeatInterval;
let lastBeatTime = null;

function startHeartbeat(intervalMs = 5000) {
    console.log(`💓 Override Heartbeat started. Interval: ${intervalMs}ms`);
    heartbeatInterval = setInterval(() => {
        lastBeatTime = new Date().toISOString();
        console.log(`💓 Override Heartbeat @ ${lastBeatTime}`);
    }, intervalMs);
}

function stopHeartbeat() {
    clearInterval(heartbeatInterval);
    console.log('💔 Override Heartbeat stopped.');
}

function getLastBeat() {
    return lastBeatTime;
}

module.exports = { startHeartbeat, stopHeartbeat, getLastBeat };

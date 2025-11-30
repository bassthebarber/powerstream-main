// /override/OverrideAuditLog.js
const fs = require('fs');
const path = require('path');

const auditLogFile = path.join(__dirname, '../logs/override-audit.log');

function logOverrideEvent(user, action, details = '') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] USER: ${user} | ACTION: ${action} | DETAILS: ${details}\n`;

    fs.appendFileSync(auditLogFile, logEntry, { encoding: 'utf8' });
    console.log(`📝 Audit Log: ${logEntry.trim()}`);
}

module.exports = { logOverrideEvent };

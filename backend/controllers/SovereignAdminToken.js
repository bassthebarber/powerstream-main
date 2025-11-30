// ✅ FILE 5: SovereignAdminToken.js
// 📁 Location: /backend/utils/SovereignAdminToken.js

function issueSovereignToken(userId) {
  return {
    issuedTo: userId,
    role: 'SovereignAdmin',
    grantedBy: 'SouthernPowerNetwork',
    timestamp: new Date().toISOString(),
    token: `SOV-ADM-${userId.toString().slice(-6)}-${Date.now()}`,
  };
}

export { issueSovereignToken  };

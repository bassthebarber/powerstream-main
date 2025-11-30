// frontend/src/utils/infinity/SystemUtils.js
// System-level helpers (health checks, status labels, etc.)

export const checkSystemHealth = async () => {
  try {
    const res = await fetch("/api/health");
    return res.ok;
  } catch {
    return false;
  }
};

export const getStatusLabel = (status) => {
  switch (status) {
    case "online": return "✅ ONLINE";
    case "offline": return "❌ OFFLINE";
    case "partial": return "⚠️ PARTIAL";
    default: return "⏳ UNKNOWN";
  }
};



// frontend/src/utils/infinity/SovereignCommandMap.js
// High-level AI commands (system-level or voice-protected)

const SovereignCommandMap = {
  "shutdown system": () => ({
    type: "SHUTDOWN",
    requiresAuth: true
  }),
  "restart brain": () => ({
    type: "REBOOT_AI",
    requiresAuth: true
  }),
  "lock override": () => ({
    type: "LOCK_OVERRIDE",
    requiresAuth: true
  }),
  "grant access": () => ({
    type: "GRANT_OVERRIDE",
    requiresAuth: true
  })
};

export default SovereignCommandMap;



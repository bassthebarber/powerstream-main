export const detectCrash = (log) => {
  if (log.includes("CRITICAL") || log.includes("Unhandled")) {
    console.error("🚨 Crash detected:", log);
    return true;
  }
  return false;
};

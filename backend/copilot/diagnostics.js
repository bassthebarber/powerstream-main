export const runDiagnostics = () => {
  const diagnostics = {
    platform: navigator.platform,
    online: navigator.onLine,
    memory: navigator.deviceMemory || "Unknown",
    userAgent: navigator.userAgent,
    screen: `${window.screen.width}x${window.screen.height}`,
  };

  console.table(diagnostics);
  return diagnostics;
};

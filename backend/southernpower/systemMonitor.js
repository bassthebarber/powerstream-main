// systemMonitor.js

const systems = ['recordingStudio', 'tvDistribution', 'nolimit', 'media'];

export const monitorSystemHealth = () => {
  const statusReport = systems.map(system => {
    // Simulate system ping and return status
    const isOnline = Math.random() > 0.05;
    return {
      system,
      status: isOnline ? '✅ Online' : '❌ Offline',
      lastPing: new Date().toISOString(),
    };
  });

  console.log('📊 System Health Report:', statusReport);
  return statusReport;
};

export const deploySensors = () => {
  console.log('📡 Infinity Sensors deployed.');
  // Example: monitor CPU, memory, AI traffic
  setInterval(() => {
    const usage = process.memoryUsage();
    if (usage.heapUsed > usage.heapTotal * 0.9) {
      console.warn('⚠️ High memory usage detected.');
    }
  }, 5000);
};

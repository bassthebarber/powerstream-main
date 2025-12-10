// InfinityCoreBridge.js
import useInfinity from '../Infinity/UseInfinity';

class InfinityCoreBridge {
  connect() {
    console.log("🔌 [InfinityCoreBridge] Connecting to Infinity Core frontend...");
    // Additional setup logic if needed
  }

  execute(command, payload) {
    const { runInfinityCommand, isOnline } = useInfinity();
    if (!isOnline) {
      console.warn(`⚠️ [InfinityCoreBridge] Infinity Core offline. Cannot execute: ${command}`);
      return;
    }
    console.log(`🚀 [InfinityCoreBridge] Executing Infinity command: ${command}`, payload);
    runInfinityCommand(command, payload);
  }
}

export default new InfinityCoreBridge();



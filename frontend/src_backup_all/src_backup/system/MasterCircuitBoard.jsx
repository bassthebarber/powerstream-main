import { io } from "socket.io-client";

class MasterCircuitBoardFrontend {
  constructor() {
    this.socket = null;
  }

  connect(url) {
    this.socket = io(url);
    this.socket.on("connect", () => {
      console.log("🔌 Connected to backend MasterCircuitBoard");
    });

    // TEST LISTENER — remove after confirming
    this.socket.on("system_health_update", (data) => {
      console.log("📡 Health update from backend:", data);
      alert(`Backend Health:\nMongo: ${data.mongoStatus}\nCore: ${data.coreStatus}\nOverride: ${data.overrideStatus}\nCopilot: ${data.copilotStatus}\nTime: ${data.time}`);
    });
  }
}

export default new MasterCircuitBoardFrontend();



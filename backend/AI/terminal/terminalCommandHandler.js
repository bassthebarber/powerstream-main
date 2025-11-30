import { handleLogicCommand } from "../core/controllers/LogicEngine.js";
const readline = await import("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function waitForCommand() {
  rl.question("⚡ Type AI Command → ", async (cmd) => {
    try {
      const result = await handleLogicCommand(cmd);
      console.log("✅ Command Result:", result);
    } catch (err) {
      console.error("❌ Command Failed:", err.message);
    }
    waitForCommand(); // Loop again
  });
}

waitForCommand();

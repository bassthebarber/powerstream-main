// backend/copilot/handfuzz2.js

export const fuzzyMatch = (input) => {
  const commands = {
    "reset server": () => "🛠 Restarting backend server...",
    "rebuild homepage": () => "🏗 Reconstructing homepage layout...",
    "clear cache": () => "🧹 Cache cleared!",
    "show logs": () => "📄 Opening log viewer...",
    "debug powerfeed": () => "🧠 Deep scan on PowerFeed component...",
    "reconnect socket": () => "🔌 Socket.IO channel re-established.",
  };

  const cleaned = input.toLowerCase().trim();

  for (let key in commands) {
    if (cleaned.includes(key)) {
      return commands[key]();
    }
  }

  return "🤖 Sorry, command not recognized. Try again.";
};

export default { fuzzyMatch };

// backend/scripts/send-command.mjs
// Tiny helper to send a Copilot command from Git Bash / PowerShell.
//
// Usage examples (from backend/):
//   node ./scripts/send-command.mjs "build powerfeed" '{"layout":"default"}'
//   node ./scripts/send-command.mjs "NAVIGATE" '{"target":"/feed"}'

const PORT = process.env.PORT || 5008;           // your server is on 5008 now
const HOST = process.env.HOST || "localhost";

const [, , cmd, argsJson = "{}"] = process.argv;

if (!cmd) {
  console.error('Usage: node scripts/send-command.mjs "<command>" \'{"key":"value"}\'');
  process.exit(1);
}

let args;
try {
  args = JSON.parse(argsJson);
} catch (e) {
  console.error("Invalid JSON for args:", e.message);
  process.exit(1);
}

const url = `http://${HOST}:${PORT}/api/copilot/command`;

try {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: cmd, args }),
  });

  const text = await res.text();
  console.log(`HTTP ${res.status}: ${text}`);
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  console.error("Request error:", err.message);
  process.exit(1);
}

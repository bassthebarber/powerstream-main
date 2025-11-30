import "dotenv/config";
import fetch from "node-fetch";

const API = process.env.AUTOPILOT_COPILOT_ENDPOINT || "http://127.0.0.1:5001/api/copilot/command";

async function run(cmd, context={}) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type":"application/json" },
    body: JSON.stringify({ command: cmd, context })
  });
  return await res.json();
}

async function main() {
  console.log("AutopilotWorker: tick", new Date().toISOString());
  // Example daily upkeep build set:
  await run("build powerfeed", { routes:{autofix:true} });
  await run("build powergram", { routes:{autofix:true} });
  await run("build powerreel", { routes:{autofix:true} });
  await run("build tv", { routes:{autofix:true}, network:"Southern Power Syndicate" });
  console.log("AutopilotWorker: done");
}

main().catch(err => {
  console.error("AutopilotWorker error", err);
  process.exit(1);
});

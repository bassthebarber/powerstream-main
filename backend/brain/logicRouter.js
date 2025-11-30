// /backend/brain/logicRouter.js
import { executeCommand } from "./commandRouter.js";
import { triggerAlert } from "./alertEngine.js";

export function routeLogic(input) {
  if (!input || typeof input !== "string") return;

  const lower = input.toLowerCase();

  if (lower.includes("deploy") || lower.includes("build")) {
    executeCommand(input);
  } else if (lower.includes("warning") || lower.includes("crash")) {
    triggerAlert("System instability detected: " + input);
  } else {
    console.log("[LogicRouter] No route match for input:", input);
  }
}

export function syncWithHUD(neuralCommand) {
  console.log(`🧠 Syncing Neural Command: ${neuralCommand}`);
  return { result: "HUD Sync Complete", command: neuralCommand };
}

export function loadIntentSequence(userCommand) {
  console.log(`📡 Loading Intent: ${userCommand}`);
  return { intent: userCommand, confirmed: true };
}

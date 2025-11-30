export function authorizeVoiceKey(user, voiceSample) {
  console.log(`🎙 Authorizing voice key for ${user}`);
  return voiceSample === "marcus" ? "Access Granted" : "Access Denied";
}

export function voiceAuthorized(voicePrint) {
  const acceptedVoice = "MARCUS_BASS";

  if (voicePrint === acceptedVoice) {
    console.log("🎤 Voice authentication passed.");
    return true;
  } else {
    console.log("❌ Unauthorized voice command.");
    return false;
  }
}

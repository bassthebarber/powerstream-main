export function transferSovereignKey(toOwnerVoiceID) {
  console.log(`🔑 Sovereign key transferred to: ${toOwnerVoiceID}`);
  return {
    status: "complete",
    newOwner: toOwnerVoiceID,
  };
}

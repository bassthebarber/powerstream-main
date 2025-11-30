export function VoiceLinkCommand(input) {
  console.log(`🎧 Voice command received: ${input}`);
  return { accepted: true, action: input };
}

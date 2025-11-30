export const voiceLink = (input) => {
  console.log(`🎙️ VoiceLink input: "${input}"`);
  // Integrate with speech-to-intent engine or direct routing
  return { action: 'process', phrase: input };
};

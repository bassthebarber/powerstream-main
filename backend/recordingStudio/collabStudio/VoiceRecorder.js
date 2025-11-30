// VoiceRecorder.js
const fs = require("fs");

const saveVoiceRecording = (userId, audioBuffer) => {
  const filename = `recording_${userId}_${Date.now()}.wav`;
  fs.writeFileSync(`./audio-uploads/${filename}`, audioBuffer);
  return filename;
};

module.exports = saveVoiceRecording;

// VoiceRecorder.js
import fs from "fs";

const saveVoiceRecording = (userId, audioBuffer) => {
  const filename = `recording_${userId}_${Date.now()}.wav`;
  fs.writeFileSync(`./audio-uploads/${filename}`, audioBuffer);
  return filename;
};

export default saveVoiceRecording;

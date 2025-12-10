// backend/utils/speechRecognizer.js
import fs from "fs";
import path from "path";
import axios from "axios";
import logUplink from "../logs/logUplink.js";

const WHISPER_API = 'https://api.openai.com/v1/audio/transcriptions';
const WHISPER_KEY = process.env.OPENAI_API_KEY;

/**
 * Convert a voice audio file to text using Whisper
 * @param {string} filePath - Path to the audio file (.wav, .mp3)
 * @returns {Promise<string>} - Transcribed text
 */
export async function transcribeSpeech(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);

    const formData = new FormData();
    formData.append('file', fileStream);
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const response = await axios.post(WHISPER_API, formData, {
      headers: {
        Authorization: `Bearer ${WHISPER_KEY}`,
        ...formData.getHeaders(),
      },
    });

    const transcript = response.data.text;
    logUplink('SpeechRecognizer', 'info', `🎙️ Transcribed: "${transcript}"`);

    return transcript;
  } catch (err) {
    logUplink('SpeechRecognizer', 'error', '❌ Transcription failed', { error: err.message });
    throw new Error('Speech recognition failed');
  }
}

export default { transcribeSpeech };

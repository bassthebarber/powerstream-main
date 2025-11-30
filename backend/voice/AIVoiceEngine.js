// backend/voice/AIVoiceEngine.js
// Fully working TTS voice system for PowerStream with OpenAI

import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function speakTextToFile(text, filename = "output.mp3") {
  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        voice: "alloy", // change to: echo, fable, onyx, nova, shimmer
        input: text,
      }),
    });

    if (!response.ok) {
      throw new Error(`TTS API error: ${response.status} ${response.statusText}`);
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const filePath = path.resolve(__dirname, `../../public/audio/${filename}`);
    fs.writeFileSync(filePath, buffer);

    console.log(`✅ TTS Audio saved to: /public/audio/${filename}`);
    return `/audio/${filename}`;
  } catch (error) {
    console.error("❌ TTS Error:", error.message);
    throw error;
  }
}

// backend/copilot/openaiBridge.js
import axios from "axios";
import "dotenv/config";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export async function askOpenAI(prompt) {
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/completions",
      {
        model: "text-davinci-003",
        prompt,
        temperature: 0.7,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (err) {
    console.error("OpenAI Error:", err.message);
    return "⚠️ AI processing failed.";
  }
}

export async function askOverride(command, context) {
  const prompt = `User issued override command: "${command}". Context: ${JSON.stringify(context)}. Determine the action.`;
  const response = await askOpenAI(prompt);
  return { action: response };
}

export default { askOpenAI, askOverride };

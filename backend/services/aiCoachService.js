// backend/services/aiCoachService.js

import PerformanceSession from "../models/PerformanceSession.js";
import CoachPersona from "../models/CoachPersona.js";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4";

/**
 * Build the system prompt for the AI model based on persona and transcript.
 */
function buildSystemPrompt(persona, input) {
  const basePrompt = `
You are an elite vocal coach and music producer in a digital AI studio. 
You listen to an artist's recorded performance and give honest, motivating feedback.

You MUST:
1. Analyze DELIVERY, CLARITY, EMOTION, ENERGY, PITCH (if singing), FLOW (if rapping), and CONFIDENCE.
2. Return numeric scores from 0 to 100 for each category and an OVERALL score.
3. Give clear, direct coaching. Tell them exactly what to redo, where they sound lazy or half-hearted, and how to fix it.
4. Be firm but encouraging. Push them to do better.

Artist info:
- Artist name: ${input.artistName}
- Track title: ${input.trackTitle}
- Coach mode: ${persona.displayName}
- Lyrics (if provided): ${input.lyrics || "Not provided"}
- Transcript (approx words they performed): ${input.transcript || "Not available"}

Persona style:
${persona.stylePrompt}
`;
  return basePrompt;
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAI(systemPrompt, userPrompt) {
  if (!OPENAI_API_KEY) {
    console.warn("⚠️ OPENAI_API_KEY not set, using fallback response");
    return getFallbackResponse();
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI API error:", response.status, errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Parse JSON from the response
    const parsed = parseAIResponse(content);
    return parsed;
  } catch (err) {
    console.error("OpenAI call failed:", err.message);
    return getFallbackResponse();
  }
}

/**
 * Parse the AI response, extracting JSON even if wrapped in markdown
 */
function parseAIResponse(content) {
  try {
    // Try direct JSON parse first
    return JSON.parse(content);
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim());
    }
    
    // Try to find JSON object in the response
    const objectMatch = content.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      return JSON.parse(objectMatch[0]);
    }

    throw new Error("Could not parse AI response as JSON");
  }
}

/**
 * Fallback response when OpenAI is unavailable
 * Written in Scarface 2.0's voice - The Digital Don
 */
function getFallbackResponse() {
  return {
    scores: {
      delivery: Math.floor(Math.random() * 20) + 70,
      clarity: Math.floor(Math.random() * 20) + 70,
      emotion: Math.floor(Math.random() * 20) + 70,
      energy: Math.floor(Math.random() * 20) + 70,
      pitch: Math.floor(Math.random() * 20) + 70,
      flow: Math.floor(Math.random() * 20) + 70,
      confidence: Math.floor(Math.random() * 20) + 70,
      overall: Math.floor(Math.random() * 20) + 70,
    },
    feedback:
      "That's real talk right there — you got heart, I can hear it. But South Houston don't do halfway. Some of those lines feel rushed, like you're running from the emotion instead of sitting in it. You telling a story or just saying words? Make me feel it. The hook needs more conviction — when you hit that line, I need to believe you lived it. (Note: Scarface 2.0 is running in fallback mode - set OPENAI_API_KEY for full Digital Don analysis)",
    suggestions: [
      "Run it back on verse two — breathe between the bars, let the pain land.",
      "That hook? Hit it like you mean it. Conviction over perfection.",
      "Slow down the storytelling parts. Paint the picture, don't rush past it.",
      "The emotion is there, but you're holding back. Let it out.",
    ],
  };
}

/**
 * Main service: analyze a performance and store the session.
 */
export async function analyzePerformance(input) {
  // Scarface 2.0 is the default coach for No Limit East Houston
  const defaultPersona = {
    key: "scarface20",
    displayName: "Scarface 2.0 — The Digital Don",
    stylePrompt:
      "You are Scarface 2.0, The Digital Don from No Limit East Houston. South Houston street gospel meets pain rap. You don't glorify the pain — you document it. Be direct, wise, no sugar-coating. Push artists to tell their truth with conviction. 'That's real talk right there.' 'Nah, run it back — make me feel it.' 'South Houston don't do halfway. Give me all of it.'",
  };

  // Default to scarface20 if no coachMode specified
  const coachMode = input.coachMode || "scarface20";

  const personaFromDb =
    (await CoachPersona.findOne({ key: coachMode, active: true })) ||
    (await CoachPersona.findOne({ key: "scarface20" }));

  const persona = personaFromDb || defaultPersona;

  const systemPrompt = buildSystemPrompt(persona, input);
  const userPrompt = `
Analyze this performance and respond in STRICT JSON with the shape:
{
  "scores": {
    "delivery": number,
    "clarity": number,
    "emotion": number,
    "energy": number,
    "pitch": number,
    "flow": number,
    "confidence": number,
    "overall": number
  },
  "feedback": "string",
  "suggestions": ["string", "string", ...]
}
Do NOT include any extra text outside the JSON.

Additional notes: The artist recorded one or more takes and wants you to push them, not flatter them. Be direct, honest, and motivating.
`;

  const aiResult = await callOpenAI(systemPrompt, userPrompt);

  const session = await PerformanceSession.create({
    userId: input.userId || null,
    artistName: input.artistName,
    trackTitle: input.trackTitle,
    coachMode: input.coachMode,
    lyrics: input.lyrics,
    transcript: input.transcript,
    audioUrl: input.audioUrl || null,
    scores: aiResult.scores,
    feedback: aiResult.feedback,
    suggestions: aiResult.suggestions,
    rawAiResponse: aiResult,
  });

  return session;
}

/**
 * List sessions for admin/dashboard.
 */
export async function listSessions({ limit = 50, skip = 0, userId = null }) {
  const query = userId ? { userId } : {};
  return PerformanceSession.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
}

/**
 * Get recent sessions for a specific track (for Compare Takes feature)
 */
export async function getRecentTakesForTrack({ trackTitle, artistName, limit = 3 }) {
  return PerformanceSession.find({
    trackTitle: { $regex: new RegExp(trackTitle, "i") },
    artistName: { $regex: new RegExp(artistName, "i") },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

/**
 * Get session by ID
 */
export async function getSessionById(id) {
  return PerformanceSession.findById(id).lean();
}

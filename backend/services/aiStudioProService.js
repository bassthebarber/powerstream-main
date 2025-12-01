// backend/services/aiStudioProService.js
// High-level AI Studio Pro engine (Vocal Analyzer, Auto Mix, Beat Gen, Tuner, Challenges)

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const DEFAULT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/**
 * Safely parse JSON even if it's wrapped in markdown ```json
 */
function safeJsonParse(raw) {
  if (!raw) return null;
  let text = raw.trim();
  if (text.startsWith("```")) {
    text = text.replace(/```json/i, "").replace(/```$/, "").trim();
  }
  // Also handle case where ``` is on its own line
  text = text.replace(/^```\w*\n?/gm, "").replace(/\n?```$/gm, "").trim();
  try {
    return JSON.parse(text);
  } catch (err) {
    // Try to extract JSON object from text
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        console.error("[aiStudioPro] JSON parse failed:", err.message);
        return null;
      }
    }
    console.error("[aiStudioPro] JSON parse failed:", err.message);
    return null;
  }
}

/**
 * Call OpenAI Chat Completions API
 */
async function callOpenAI(systemPrompt, userPrompt, temperature = 0.3) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      temperature,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("[aiStudioPro] OpenAI API error:", response.status, errorData);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

/**
 * Genre profiles: how we judge and coach different styles.
 */
const genreProfiles = {
  RNB: {
    keyFocus: "Pitch accuracy, runs, vibrato, smooth transitions, breath control, dynamic control.",
    vibe: "Modern R&B / Neo-soul. Think clean, silky, precise.",
  },
  SOUTHERN_SOUL: {
    keyFocus:
      "Grit, storytelling, emotional delivery, phrasing, call-and-response feel, church and blues influence.",
    vibe: "Southern soul, juke joint, real-life story, heart and pain.",
  },
  RAP: {
    keyFocus:
      "Flow, rhythm, breath control, punch-ins, bar structure, pocket with the beat, conviction.",
    vibe: "Rap delivery, cadence, confidence, timing.",
  },
  POP: {
    keyFocus: "Hook delivery, clarity, energy consistency, commercial appeal, memorable phrases.",
    vibe: "Clean, catchy, radio-ready.",
  },
  HIPHOP: {
    keyFocus: "Bars, wordplay, cadence switches, delivery variety, punchlines, swagger.",
    vibe: "Hip-hop authenticity, lyrical content, presence.",
  },
  GOSPEL: {
    keyFocus: "Emotional conviction, melisma, dynamic builds, spiritual connection, power notes.",
    vibe: "Church feel, testimony, passion.",
  },
};

/**
 * Coach modes (personas), including aggressive "Drae Mode".
 */
const coachModes = {
  STANDARD: {
    label: "Standard Coach",
    style: "Direct but respectful coach. Encouraging, specific, and focused on helping the artist grow.",
  },
  RNB_COACH: {
    label: "R&B Vocal Coach",
    style: "High-level R&B vocal coach. Focus on pitch, runs, tone color, dynamics, and control.",
  },
  SOUTHERN_SOUL_COACH: {
    label: "Southern Soul Coach",
    style: "Old-school southern soul coach. Focus on emotion, honesty, storytelling, phrasing, and grit.",
  },
  DRAE_MODE: {
    label: "Drae Mode (Aggressive)",
    style:
      "Hard, aggressive studio boss. No sugar-coating. Calls out laziness, weak energy, sloppy performance. Demands excellence. Uses tough love to push artists beyond their limits.",
  },
  PRODUCER: {
    label: "Producer Mode",
    style: "Technical producer perspective. Focus on how the performance sits in the mix, pocket, and commercial viability.",
  },
  MENTOR: {
    label: "Mentor Mode",
    style: "Supportive mentor who builds confidence while pointing out growth areas. Celebrates wins, frames criticism positively.",
  },
};

function buildSystemPrompt({ genre = "RAP", coachMode = "STANDARD" } = {}) {
  const g = genreProfiles[genre] || genreProfiles.RAP;
  const c = coachModes[coachMode] || coachModes.STANDARD;

  return `
You are an advanced AI studio coach and vocal/mix engineer in a professional recording studio.

GENRE PROFILE:
- Genre focus: ${genre}
- Key evaluation focus: ${g.keyFocus}
- Typical vibe: ${g.vibe}

COACH PERSONA:
- Mode: ${c.label}
- Style: ${c.style}

RULES:
- Speak to the artist directly in second person.
- Be specific and constructive.
- Return STRICT JSON only, no additional text.
- Give actionable, professional feedback.
`;
}

// ============================================
// VOCAL ANALYZER
// ============================================
export async function analyzeVocals({
  transcript,
  performanceNotes,
  genre = "RNB",
  coachMode = "STANDARD",
}) {
  if (!OPENAI_API_KEY) {
    return {
      overallScore: 70 + Math.floor(Math.random() * 15),
      pitchAccuracy: 0.7 + Math.random() * 0.2,
      timingFeel: "slightly dragging",
      noteIssues: ["Flat notes in chorus", "Pitchy on the bridge"],
      genreSpecificNotes: "Good tone but shaky control. Work on breath support.",
      actionSteps: ["Practice chorus slowly with piano", "Record phrase by phrase"],
      oneLineSummary: "You're close—fix pitch stability in chorus. (AI running in fallback mode)",
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode });
  const userPrompt = `
Return STRICT JSON:

{
  "overallScore": number,
  "pitchAccuracy": number,
  "timingFeel": "string",
  "noteIssues": [ "string" ],
  "genreSpecificNotes": "string",
  "actionSteps": [ "string" ],
  "oneLineSummary": "string"
}

Transcript:
${transcript || "Not provided"}

Performance notes:
${performanceNotes || "Not provided"}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.2);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[analyzeVocals] Error:", err.message);
    return { error: err.message };
  }
}

// ============================================
// AUTO MIX BEAT
// ============================================
export async function autoMixBeat({ stemsDescription, genre = "RAP", coachMode = "PRODUCER" }) {
  if (!OPENAI_API_KEY) {
    return {
      mixStrategy: "Stub mix: vocals slightly above beat, compress to taste.",
      perStem: [
        {
          stemName: "Vocals",
          levelAdvice: "-3dB from peak",
          panningAdvice: "Center",
          eqAdvice: ["Cut 200-400Hz mud", "Boost 3-5kHz presence"],
          compressionAdvice: ["4:1 ratio", "Medium attack"],
          fxAdvice: ["Light plate reverb", "Slap delay on hooks"],
        },
      ],
      busRecommendations: [
        { name: "Vocal Bus", processingChain: ["SSL compressor", "Pultec EQ"] },
      ],
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode });
  const userPrompt = `
Return STRICT JSON:

{
  "mixStrategy": "string",
  "busRecommendations": [
    { "name": "string", "processingChain": [ "string" ] }
  ],
  "perStem": [
    {
      "stemName": "string",
      "levelAdvice": "string",
      "panningAdvice": "string",
      "eqAdvice": [ "string" ],
      "compressionAdvice": [ "string" ],
      "fxAdvice": [ "string" ]
    }
  ]
}

Stems:
${stemsDescription || "Vocals, Beat (kick, snare, hats), Bass, Synths"}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.3);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[autoMixBeat] Error:", err.message);
    return { error: err.message };
  }
}

// ============================================
// BEAT PLAN GENERATOR
// ============================================
export async function generateBeatPlan({
  mood,
  tempoBpm,
  genre = "RAP",
  coachMode = "PRODUCER",
  referenceArtists,
}) {
  if (!OPENAI_API_KEY) {
    return {
      bpm: tempoBpm || 90,
      keySuggestion: "C minor",
      swingFeel: "even 16ths",
      drumPattern: {
        kick: "1, 2-and, 3, 4-and",
        snare: "2, 4",
        hihat: "8th notes with occasional 16th rolls",
        percussion: "Rimshot on offbeats",
      },
      bassPattern: "Follow kick with octave jumps",
      chordIdeas: ["Cm7 - Fm7 - Gm7 - Ab"],
      sections: [
        { name: "Intro", bars: 4, energy: "low", notes: ["Atmospheric", "Build tension"] },
        { name: "Verse", bars: 16, energy: "medium", notes: ["Sparse drums", "Room for vocals"] },
        { name: "Hook", bars: 8, energy: "high", notes: ["Full drums", "Melodic bass"] },
      ],
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode });
  const userPrompt = `
Return STRICT JSON for a beat plan:

{
  "bpm": number,
  "keySuggestion": "string",
  "swingFeel": "string",
  "drumPattern": {
    "kick": "string",
    "snare": "string",
    "hihat": "string",
    "percussion": "string"
  },
  "bassPattern": "string",
  "chordIdeas": [ "string" ],
  "sections": [
    {
      "name": "string",
      "bars": number,
      "energy": "string",
      "notes": [ "string" ]
    }
  ]
}

Mood: ${mood || "dark, atmospheric"}
Tempo: ${tempoBpm || 90} BPM
References: ${referenceArtists || "Not specified"}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.4);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[generateBeatPlan] Error:", err.message);
    return { error: err.message };
  }
}

// ============================================
// AUTO VOCAL TUNER
// ============================================
export async function autoVocalTuner({ vocalAnalysisSummary, genre = "RNB", coachMode = "RNB_COACH" }) {
  if (!OPENAI_API_KEY) {
    return {
      suggestedKey: "C minor",
      suggestedScale: "minor pentatonic",
      autotuneAmount: "medium",
      retuneSpeed: "fast",
      humanizeAmount: "medium",
      focusPhrases: ["Chorus hook", "Bridge run"],
      processingNotes: [
        "Apply light pitch correction to verses",
        "Heavier correction on chorus for effect",
        "Leave ad-libs natural",
      ],
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode });
  const userPrompt = `
Return STRICT JSON:

{
  "suggestedKey": "string",
  "suggestedScale": "string",
  "autotuneAmount": "string",
  "retuneSpeed": "string",
  "humanizeAmount": "string",
  "focusPhrases": [ "string" ],
  "processingNotes": [ "string" ]
}

Vocal Analysis Summary:
${vocalAnalysisSummary || "General vocal performance, some pitch issues on chorus"}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.2);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[autoVocalTuner] Error:", err.message);
    return { error: err.message };
  }
}

// ============================================
// CHALLENGE MODE
// ============================================
export async function createChallenge({ artistName, genre = "RAP", targetScore = 85 }) {
  if (!OPENAI_API_KEY) {
    return {
      title: "Beat Your Best",
      description: `${artistName || "Artist"}, your mission: hit ${targetScore}+ on your next take.`,
      targetScore,
      rules: [
        "One take, no punch-ins",
        "Perform the full song",
        "Maintain energy throughout",
      ],
      motivation: "You've been warming up. Now it's time to deliver. No excuses. Let's go.",
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode: "DRAE_MODE" });
  const userPrompt = `
Return STRICT JSON:

{
  "title": "string",
  "description": "string",
  "targetScore": number,
  "rules": [ "string" ],
  "motivation": "string"
}

Artist: ${artistName || "Unknown Artist"}
Target score: ${targetScore}
Genre: ${genre}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.5);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[createChallenge] Error:", err.message);
    return { error: err.message };
  }
}

// ============================================
// CHALLENGE EVALUATION
// ============================================
export async function evaluateChallengeTake({ challenge, latestScores, genre = "RAP" }) {
  if (!OPENAI_API_KEY) {
    const passed = (latestScores?.overallScore || 0) >= (challenge?.targetScore || 85);
    return {
      passed,
      message: passed
        ? "You did that. Challenge complete. Now set a higher target."
        : "Not yet. You know what you need to fix. Run it back.",
      scoreBreakdown: latestScores,
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode: "DRAE_MODE" });
  const userPrompt = `
Return STRICT JSON:

{
  "passed": boolean,
  "message": "string",
  "scoreBreakdown": object
}

CHALLENGE:
${JSON.stringify(challenge, null, 2)}

LATEST SCORES:
${JSON.stringify(latestScores, null, 2)}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.3);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[evaluateChallengeTake] Error:", err.message);
    return { error: err.message };
  }
}

// ============================================
// QUICK FEEDBACK (lightweight analysis)
// ============================================
export async function quickFeedback({ transcript, genre = "RAP", coachMode = "STANDARD" }) {
  if (!OPENAI_API_KEY) {
    return {
      vibe: "Solid energy",
      quickTip: "Tighten up the pocket on verse 2",
      score: 75 + Math.floor(Math.random() * 15),
    };
  }

  const systemPrompt = buildSystemPrompt({ genre, coachMode });
  const userPrompt = `
Return STRICT JSON (keep it brief):

{
  "vibe": "string (one line mood/energy assessment)",
  "quickTip": "string (single most important fix)",
  "score": number (0-100)
}

Transcript:
${transcript || "Performance audio analyzed"}
`;

  try {
    const content = await callOpenAI(systemPrompt, userPrompt, 0.3);
    return safeJsonParse(content) || { error: "Failed to parse response" };
  } catch (err) {
    console.error("[quickFeedback] Error:", err.message);
    return { error: err.message };
  }
}

// Export genre and coach mode options for frontend dropdowns
export const genres = Object.keys(genreProfiles);
export const coachModeKeys = Object.keys(coachModes);
export const genreProfilesData = genreProfiles;
export const coachModesData = coachModes;




// backend/services/AICopyrightEngine.js
// AI Copyright Engine - Generates copyright summaries and legal text

import crypto from "crypto";

// Check if OpenAI is available
let openai = null;
try {
  const OpenAI = (await import("openai")).default;
  if (process.env.OPENAI_KEY || process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ 
      apiKey: process.env.OPENAI_KEY || process.env.OPENAI_API_KEY 
    });
  }
} catch (e) {
  console.log("[AICopyrightEngine] OpenAI not available, using fallback");
}

/**
 * Generate copyright data using AI or fallback
 * 
 * @param {string} title - Title of the work
 * @param {Array} creators - Array of { name, role, split }
 * @param {Object} metadata - Optional metadata { duration, genre, bpm, key }
 * @returns {Object} { summary, legal, keywords, genre, mood }
 */
export async function generateCopyrightData(title, creators, metadata = {}) {
  const names = creators.map(c => `${c.role}: ${c.name} (${c.split}%)`).join(", ");

  // Try AI generation first
  if (openai) {
    try {
      const prompt = `You are a music copyright registration AI assistant.
Generate a professional copyright registration summary and legal ownership text for:

Title: "${title}"
Creators: ${names}
${metadata.genre ? `Genre: ${metadata.genre}` : ""}
${metadata.duration ? `Duration: ${Math.floor(metadata.duration / 60)}:${String(Math.floor(metadata.duration % 60)).padStart(2, "0")}` : ""}

Respond with ONLY valid JSON (no markdown, no explanation):
{
  "summary": "A brief 1-2 sentence copyright summary",
  "legal": "Full legal copyright notice with all parties and their shares",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "genre": "detected or suggested genre",
  "mood": ["mood1", "mood2"]
}`;

      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      });

      const content = result.choices[0].message.content.trim();
      
      // Try to parse JSON, handling potential markdown code blocks
      let jsonContent = content;
      if (content.startsWith("```")) {
        jsonContent = content.replace(/```json?\n?/g, "").replace(/```$/g, "").trim();
      }
      
      return JSON.parse(jsonContent);
    } catch (err) {
      console.error("[AICopyrightEngine] AI generation failed:", err.message);
      // Fall through to fallback
    }
  }

  // Fallback generation (no AI)
  return generateFallbackCopyrightData(title, creators, metadata);
}

/**
 * Fallback copyright generation without AI
 */
function generateFallbackCopyrightData(title, creators, metadata = {}) {
  const year = new Date().getFullYear();
  const primaryCreator = creators.find(c => c.role === "artist") || creators[0];
  
  // Build ownership string
  const ownershipParts = creators.map(c => {
    const roleTitle = c.role.charAt(0).toUpperCase() + c.role.slice(1);
    return `${c.name} (${roleTitle}, ${c.split}%)`;
  });

  const summary = `© ${year} "${title}" by ${primaryCreator?.name || "Unknown Artist"}. All rights reserved. Registered with Southern Power Stream.`;

  const legal = `COPYRIGHT NOTICE

Work Title: "${title}"
Registration Year: ${year}
Registration Platform: Southern Power Stream (SPS)

OWNERSHIP STRUCTURE:
${ownershipParts.map((p, i) => `${i + 1}. ${p}`).join("\n")}

This musical work is protected under applicable copyright laws. All rights are reserved by the copyright holders listed above according to their respective ownership shares. Unauthorized reproduction, distribution, or public performance is prohibited without express written consent from the rights holders.

For licensing inquiries, contact: licensing@southernpowerstream.com`;

  // Generate keywords based on title and metadata
  const keywords = generateKeywords(title, metadata);
  
  // Detect genre from metadata or default
  const genre = metadata.genre || detectGenre(title, creators);
  
  // Detect mood
  const mood = detectMood(title, genre);

  return {
    summary,
    legal,
    keywords,
    genre,
    mood,
  };
}

/**
 * Generate keywords from title and metadata
 */
function generateKeywords(title, metadata = {}) {
  const keywords = new Set();
  
  // Add words from title
  const titleWords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  titleWords.forEach(w => keywords.add(w));
  
  // Add genre if available
  if (metadata.genre) {
    keywords.add(metadata.genre.toLowerCase());
  }
  
  // Add common music keywords
  keywords.add("music");
  keywords.add("original");
  keywords.add("copyright");
  
  return Array.from(keywords).slice(0, 10);
}

/**
 * Detect genre from context
 */
function detectGenre(title, creators) {
  const titleLower = title.toLowerCase();
  
  // Check for genre indicators in title
  if (titleLower.includes("trap") || titleLower.includes("drill")) return "Hip-Hop/Trap";
  if (titleLower.includes("soul") || titleLower.includes("r&b")) return "R&B/Soul";
  if (titleLower.includes("rock") || titleLower.includes("guitar")) return "Rock";
  if (titleLower.includes("gospel") || titleLower.includes("praise")) return "Gospel";
  if (titleLower.includes("country") || titleLower.includes("texas")) return "Country";
  if (titleLower.includes("beat") || titleLower.includes("instrumental")) return "Instrumental";
  
  // Check creator roles for hints
  const hasProducer = creators.some(c => c.role === "producer");
  const hasWriter = creators.some(c => c.role === "writer" || c.role === "composer");
  
  if (hasProducer && !hasWriter) return "Hip-Hop/Beats";
  
  return "Urban/Contemporary";
}

/**
 * Detect mood from title and genre
 */
function detectMood(title, genre) {
  const titleLower = title.toLowerCase();
  const moods = [];
  
  // Positive indicators
  if (titleLower.includes("love") || titleLower.includes("happy") || titleLower.includes("joy")) {
    moods.push("uplifting");
  }
  
  // Intense indicators
  if (titleLower.includes("fire") || titleLower.includes("hot") || titleLower.includes("lit")) {
    moods.push("energetic");
  }
  
  // Chill indicators
  if (titleLower.includes("chill") || titleLower.includes("vibe") || titleLower.includes("smooth")) {
    moods.push("relaxed");
  }
  
  // Default moods based on genre
  if (moods.length === 0) {
    switch (genre) {
      case "Hip-Hop/Trap":
        moods.push("energetic", "confident");
        break;
      case "R&B/Soul":
        moods.push("smooth", "emotional");
        break;
      case "Gospel":
        moods.push("uplifting", "spiritual");
        break;
      default:
        moods.push("dynamic");
    }
  }
  
  return moods.slice(0, 3);
}

/**
 * Generate blockchain-ready hash proof
 * 
 * @param {Object} data - Registration data
 * @returns {Object} { hash, timestamp }
 */
export function generateHashProof(data) {
  const timestamp = new Date();
  const proofData = JSON.stringify({
    title: data.title,
    owners: data.owners,
    type: data.type,
    timestamp: timestamp.toISOString(),
  });
  
  const hash = crypto
    .createHash("sha256")
    .update(proofData)
    .digest("hex");
  
  return {
    hash,
    timestamp,
    proofData,
  };
}

/**
 * Verify a hash proof
 */
export function verifyHashProof(hash, data, timestamp) {
  const proofData = JSON.stringify({
    title: data.title,
    owners: data.owners,
    type: data.type,
    timestamp: timestamp.toISOString(),
  });
  
  const computedHash = crypto
    .createHash("sha256")
    .update(proofData)
    .digest("hex");
  
  return hash === computedHash;
}

export default {
  generateCopyrightData,
  generateHashProof,
  verifyHashProof,
};



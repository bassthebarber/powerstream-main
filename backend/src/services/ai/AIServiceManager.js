// backend/src/services/ai/AIServiceManager.js
// Unified AI Service Manager - Controls all AI capabilities in PowerStream

import { features, serviceNotConfiguredResponse } from '../../config/featureFlags.js';

/**
 * AI Service Configuration
 */
const AI_SERVICES = {
  musicgen: {
    name: 'MusicGen',
    envKeys: ['MUSICGEN_API_BASE', 'MUSICGEN_API_KEY'],
    category: 'audio',
    description: 'AI-powered beat and music generation',
  },
  openai: {
    name: 'OpenAI GPT',
    envKeys: ['OPENAI_API_KEY'],
    category: 'text',
    description: 'Lyrics, descriptions, and AI chat',
  },
  claude: {
    name: 'Anthropic Claude',
    envKeys: ['ANTHROPIC_API_KEY'],
    category: 'text',
    description: 'Advanced AI reasoning and content',
  },
  lyrics: {
    name: 'AI Lyrics',
    envKeys: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    category: 'text',
    description: 'AI-powered lyrics generation',
    anyOf: true, // Only needs one of the keys
  },
  remix: {
    name: 'AI Remix',
    envKeys: ['MUSICGEN_API_BASE'],
    category: 'audio',
    description: 'AI-powered track remixing',
  },
  mastering: {
    name: 'AI Mastering',
    envKeys: ['OPENAI_API_KEY'],
    category: 'audio',
    description: 'AI-assisted audio mastering',
  },
  pulse: {
    name: 'AI Pulse',
    envKeys: ['OPENAI_API_KEY', 'ANTHROPIC_API_KEY'],
    category: 'assistant',
    description: 'PowerStream AI assistant',
    anyOf: true,
  },
};

/**
 * Check if a service is enabled based on environment variables
 */
function isServiceEnabled(serviceName) {
  const service = AI_SERVICES[serviceName];
  if (!service) return false;

  if (service.anyOf) {
    // At least one of the keys must be present
    return service.envKeys.some(key => !!process.env[key]);
  }

  // All keys must be present (or just the first one for simple configs)
  return !!process.env[service.envKeys[0]];
}

/**
 * Get all AI service statuses
 */
export function getAIServiceStatus() {
  const statuses = {};
  for (const [key, service] of Object.entries(AI_SERVICES)) {
    statuses[key] = {
      name: service.name,
      enabled: isServiceEnabled(key),
      category: service.category,
      description: service.description,
      requires: service.envKeys,
    };
  }
  return statuses;
}

/**
 * OpenAI API Client
 */
class OpenAIClient {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseUrl = process.env.OPENAI_API_BASE || 'https://api.openai.com/v1';
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  get isEnabled() {
    return !!this.apiKey;
  }

  async chat(messages, options = {}) {
    if (!this.isEnabled) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model || this.model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 2000,
        ...options.extra,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return {
      content: data.choices?.[0]?.message?.content || '',
      usage: data.usage,
      model: data.model,
    };
  }

  async complete(prompt, options = {}) {
    return this.chat([{ role: 'user', content: prompt }], options);
  }
}

/**
 * Claude API Client
 */
class ClaudeClient {
  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.baseUrl = 'https://api.anthropic.com/v1';
    this.model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
  }

  get isEnabled() {
    return !!this.apiKey;
  }

  async chat(messages, options = {}) {
    if (!this.isEnabled) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert OpenAI-style messages to Claude format
    const systemMessage = messages.find(m => m.role === 'system');
    const chatMessages = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    }));

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: options.model || this.model,
        max_tokens: options.maxTokens ?? 2000,
        system: systemMessage?.content,
        messages: chatMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${error.error?.message || response.status}`);
    }

    const data = await response.json();
    return {
      content: data.content?.[0]?.text || '',
      usage: data.usage,
      model: data.model,
    };
  }

  async complete(prompt, options = {}) {
    return this.chat([{ role: 'user', content: prompt }], options);
  }
}

// Singleton instances
const openai = new OpenAIClient();
const claude = new ClaudeClient();

/**
 * Unified AI completion with fallback
 * Tries OpenAI first, then Claude, with graceful degradation
 */
export async function aiComplete(prompt, options = {}) {
  const { preferredProvider = 'auto', fallbackSafe = true } = options;

  // Determine which provider to use
  const providers = [];
  if (preferredProvider === 'openai' || preferredProvider === 'auto') {
    if (openai.isEnabled) providers.push({ name: 'openai', client: openai });
  }
  if (preferredProvider === 'claude' || preferredProvider === 'auto') {
    if (claude.isEnabled) providers.push({ name: 'claude', client: claude });
  }

  // Try each provider in order
  for (const provider of providers) {
    try {
      console.log(`🤖 [AI] Using ${provider.name} for completion`);
      const result = await provider.client.complete(prompt, options);
      return {
        ok: true,
        provider: provider.name,
        ...result,
      };
    } catch (err) {
      console.warn(`⚠️ [AI] ${provider.name} failed:`, err.message);
      if (!fallbackSafe || providers.indexOf(provider) === providers.length - 1) {
        throw err;
      }
    }
  }

  // No providers available
  if (fallbackSafe) {
    return {
      ok: false,
      code: 'NO_AI_PROVIDER',
      message: 'No AI provider is configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY.',
      fallback: true,
    };
  }

  throw new Error('No AI provider available');
}

/**
 * AI Chat with conversation history
 */
export async function aiChat(messages, options = {}) {
  const { preferredProvider = 'auto', fallbackSafe = true } = options;

  const providers = [];
  if (preferredProvider === 'openai' || preferredProvider === 'auto') {
    if (openai.isEnabled) providers.push({ name: 'openai', client: openai });
  }
  if (preferredProvider === 'claude' || preferredProvider === 'auto') {
    if (claude.isEnabled) providers.push({ name: 'claude', client: claude });
  }

  for (const provider of providers) {
    try {
      console.log(`🤖 [AI] Using ${provider.name} for chat`);
      const result = await provider.client.chat(messages, options);
      return {
        ok: true,
        provider: provider.name,
        ...result,
      };
    } catch (err) {
      console.warn(`⚠️ [AI] ${provider.name} failed:`, err.message);
      if (!fallbackSafe || providers.indexOf(provider) === providers.length - 1) {
        throw err;
      }
    }
  }

  if (fallbackSafe) {
    return {
      ok: false,
      code: 'NO_AI_PROVIDER',
      message: 'No AI provider is configured.',
      fallback: true,
    };
  }

  throw new Error('No AI provider available');
}

/**
 * Generate lyrics using AI
 */
export async function generateLyrics({ mood, genre, topic, style = 'verse', options = {} }) {
  const systemPrompt = `You are a professional songwriter and lyricist who creates compelling, authentic lyrics. 
Your lyrics should:
- Be creative and emotionally resonant
- Match the specified mood and genre
- Use natural rhythm and flow
- Avoid clichés while still being relatable
- Include metaphors and vivid imagery`;

  const userPrompt = `Write ${style} lyrics for a ${genre} song.
Mood: ${mood}
Topic/Theme: ${topic}

Create compelling lyrics that fit this vibe. Include:
- Strong hooks and memorable lines
- Natural flow and rhythm
- Emotional depth

Output only the lyrics, no explanations.`;

  const result = await aiChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ], { ...options, fallbackSafe: true });

  if (!result.ok && result.fallback) {
    // Provide sample lyrics as fallback
    return {
      ok: true,
      lyrics: getFallbackLyrics(mood, genre),
      source: 'fallback',
      message: 'AI lyrics generation not configured. Here are sample lyrics.',
    };
  }

  return {
    ok: true,
    lyrics: result.content,
    source: result.provider,
  };
}

/**
 * AI-powered mix suggestions
 */
export async function getMixSuggestions({ trackInfo, currentMix, targetGenre }) {
  const prompt = `As a professional mixing engineer, analyze this track and provide mixing suggestions:

Track Info: ${JSON.stringify(trackInfo)}
Current Mix Settings: ${JSON.stringify(currentMix)}
Target Genre: ${targetGenre}

Provide specific, actionable suggestions for:
1. EQ adjustments for each element
2. Compression recommendations
3. Spatial positioning (stereo width, reverb)
4. Level balancing
5. Any processing effects

Format as a JSON object with clear categories.`;

  const result = await aiComplete(prompt, { fallbackSafe: true });

  if (!result.ok && result.fallback) {
    return {
      ok: true,
      suggestions: getDefaultMixSuggestions(targetGenre),
      source: 'fallback',
    };
  }

  try {
    const suggestions = JSON.parse(result.content);
    return { ok: true, suggestions, source: result.provider };
  } catch {
    return { ok: true, suggestions: result.content, source: result.provider };
  }
}

/**
 * AI Mastering analysis and suggestions
 */
export async function getMasteringSuggestions({ audioAnalysis, targetLoudness = -14, genre }) {
  const prompt = `As a mastering engineer, analyze this track and provide mastering recommendations:

Audio Analysis: ${JSON.stringify(audioAnalysis)}
Target Loudness (LUFS): ${targetLoudness}
Genre: ${genre}

Provide:
1. EQ curve suggestions
2. Compression/limiting settings
3. Stereo enhancement recommendations
4. Final loudness targets
5. Any genre-specific processing

Format as JSON.`;

  const result = await aiComplete(prompt, { fallbackSafe: true });

  if (!result.ok && result.fallback) {
    return {
      ok: true,
      suggestions: getDefaultMasteringSuggestions(genre, targetLoudness),
      source: 'fallback',
    };
  }

  try {
    const suggestions = JSON.parse(result.content);
    return { ok: true, suggestions, source: result.provider };
  } catch {
    return { ok: true, suggestions: result.content, source: result.provider };
  }
}

/**
 * AI Pulse - PowerStream's AI assistant
 */
export async function aiPulse(query, context = {}) {
  const systemPrompt = `You are AI Pulse, PowerStream's intelligent assistant. You help users with:
- Music production and recording
- Beat creation and selection
- Mixing and mastering
- Platform features and navigation
- Creative suggestions and feedback

Be concise, helpful, and encouraging. Use music industry terminology when appropriate.
Current user context: ${JSON.stringify(context)}`;

  const result = await aiChat([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: query },
  ], { fallbackSafe: true, maxTokens: 500 });

  if (!result.ok && result.fallback) {
    return {
      ok: false,
      message: 'AI Pulse is not configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY.',
      code: 'SERVICE_NOT_CONFIGURED',
    };
  }

  return {
    ok: true,
    response: result.content,
    source: result.provider,
  };
}

// ========== Fallback Content ==========

function getFallbackLyrics(mood, genre) {
  const fallbacks = {
    dark: `Shadows fall, the night takes hold
Stories left, still untold
Through the darkness, I find my way
Tomorrow brings another day`,
    uplifting: `Rise up high, touch the sky
Dreams are meant for you and I
Every step we take is gold
This is our story, yet untold`,
    aggressive: `No more games, this is war
Kicking down every door
Stand my ground, hold the line
Victory's gonna be mine`,
    chill: `Floating on a summer breeze
Palm trees swaying, mind at ease
Let the rhythm take control
Music healing every soul`,
  };

  return fallbacks[mood] || fallbacks.chill;
}

function getDefaultMixSuggestions(genre) {
  const defaults = {
    trap: {
      kick: { highPass: 30, lowShelf: { freq: 80, gain: 3 } },
      snare: { midBoost: { freq: 2000, gain: 2 }, compression: { ratio: 4 } },
      hihat: { highShelf: { freq: 8000, gain: 2 } },
      vocals: { deEss: true, compression: { ratio: 3 } },
    },
    rnb: {
      vocals: { warmth: true, reverb: 'plate', delay: 'subtle' },
      bass: { smooth: true, subHarmonics: false },
      keys: { stereoWidth: 80, reverb: 'hall' },
    },
  };
  return defaults[genre] || defaults.trap;
}

function getDefaultMasteringSuggestions(genre, targetLoudness) {
  return {
    eq: {
      lowCut: 25,
      airBoost: { freq: 12000, gain: 1.5 },
    },
    compression: {
      ratio: 2,
      threshold: -6,
      attack: 30,
      release: 100,
    },
    limiter: {
      ceiling: -0.3,
      release: 100,
    },
    targetLufs: targetLoudness,
    notes: `Standard mastering chain for ${genre}. Adjust based on source material.`,
  };
}

// ========== Exports ==========

export default {
  getAIServiceStatus,
  aiComplete,
  aiChat,
  generateLyrics,
  getMixSuggestions,
  getMasteringSuggestions,
  aiPulse,
  isServiceEnabled,
  openai,
  claude,
};



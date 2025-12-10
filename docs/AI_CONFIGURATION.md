# PowerStream AI Configuration Guide

**Version:** 1.0  
**Last Updated:** December 6, 2025

---

## 🤖 Overview

PowerStream supports multiple AI providers with safe fallback behavior. All AI services degrade gracefully when not configured.

---

## 📋 Environment Variables

### MusicGen (Beat Generation)

```env
# Option 1: Self-hosted MusicGen
MUSICGEN_API_BASE=http://localhost:9100

# Option 2: Cloud MusicGen service
MUSICGEN_API_BASE=https://api.replicate.com/v1
MUSICGEN_API_KEY=your_replicate_key
```

**Enables:**
- `musicgen` - AI Beat Generation
- `aiBeats` - AI Beat Generation  
- `aiRemix` - AI Remix Engine

**Fallback:** Pattern-based beat generation (no audio, MIDI-like patterns)

---

### OpenAI (Text/Chat AI)

```env
OPENAI_API_KEY=sk-...
OPENAI_API_BASE=https://api.openai.com/v1  # Optional, defaults to OpenAI
OPENAI_MODEL=gpt-4-turbo-preview           # Optional, defaults to gpt-4-turbo-preview
```

**Enables:**
- `openai` - OpenAI GPT
- `aiLyrics` - AI Lyrics Generation
- `aiMix` - AI Mix Suggestions
- `aiMastering` - AI Mastering Suggestions
- `aiPulse` - AI Pulse Assistant

**Fallback:** Static suggestions and sample content

---

### Claude (Advanced AI)

```env
ANTHROPIC_API_KEY=sk-ant-...
CLAUDE_MODEL=claude-3-sonnet-20240229  # Optional
```

**Enables:**
- `claude` - Anthropic Claude
- `aiLyrics` - AI Lyrics Generation (fallback to Claude if OpenAI unavailable)
- `aiMix` - AI Mix Suggestions
- `aiMastering` - AI Mastering Suggestions  
- `aiPulse` - AI Pulse Assistant

**Priority:** OpenAI is tried first, then Claude as fallback

---

## 🎯 Service Matrix

| Feature | MusicGen | OpenAI | Claude | Fallback Available |
|---------|:--------:|:------:|:------:|:------------------:|
| Beat Generation | ✅ | - | - | ✅ Pattern Mode |
| Lyrics | - | ✅ | ✅ | ✅ Sample Lyrics |
| Mix Suggestions | - | ✅ | ✅ | ✅ Default Tips |
| Mastering Suggestions | - | ✅ | ✅ | ✅ Default Tips |
| AI Pulse Chat | - | ✅ | ✅ | ❌ Not Available |
| Remix | ✅ | - | - | ❌ Not Available |

---

## 🔌 API Endpoints

### Health Check

```
GET /api/ai/health
```

Returns status of all AI services:

```json
{
  "ok": true,
  "service": "PowerStream AI",
  "summary": {
    "total": 8,
    "enabled": 5,
    "disabled": 3
  },
  "services": {
    "musicgen": { "enabled": true, "category": "audio" },
    "openai": { "enabled": true, "category": "text" },
    "claude": { "enabled": false, "category": "text" }
  }
}
```

### AI Pulse (Assistant)

```
POST /api/ai/pulse
Authorization: Bearer <token>

{
  "query": "How do I make my 808s hit harder?",
  "context": { "genre": "trap" }
}
```

### Lyrics Generation

```
POST /api/ai/lyrics
Authorization: Bearer <token>

{
  "mood": "dark",
  "genre": "trap",
  "topic": "success and struggles",
  "style": "verse"
}
```

### Mix Suggestions

```
POST /api/ai/mix-suggestions
Authorization: Bearer <token>

{
  "trackInfo": { "name": "My Track", "bpm": 140 },
  "currentMix": {},
  "targetGenre": "trap"
}
```

### Mastering Suggestions

```
POST /api/ai/mastering-suggestions
Authorization: Bearer <token>

{
  "audioAnalysis": { "peakDb": -3, "rms": -18 },
  "targetLoudness": -14,
  "genre": "trap"
}
```

---

## 💡 Frontend Usage

```javascript
import aiService from "../services/aiService.js";

// Check AI status
const status = await aiService.getAIStatus();
console.log("AI Services:", status.services);

// Use AI Pulse
const response = await aiService.queryAIPulse("How do I mix vocals?");
if (response.ok) {
  console.log("AI says:", response.response);
} else if (response.notConfigured) {
  // Show "AI not configured" banner
  console.log(response.message);
}

// Generate lyrics
const lyrics = await aiService.generateLyrics({
  mood: "uplifting",
  genre: "rnb",
  topic: "finding love",
});
```

---

## 🔒 Security

- All AI endpoints require authentication (`Bearer` token)
- API keys are server-side only (never exposed to frontend)
- Rate limiting recommended for production

---

## 🛠️ Fallback Behavior

When AI services are not configured:

1. **API Response:**
   ```json
   {
     "ok": false,
     "code": "SERVICE_NOT_CONFIGURED",
     "message": "MusicGen is not configured for this environment."
   }
   ```

2. **Frontend Handling:**
   - Shows user-friendly banner
   - Falls back to manual features
   - No errors or crashes

3. **Safe Defaults:**
   - Beat generation: Returns pattern data (no audio)
   - Lyrics: Returns sample lyrics
   - Mix/Master: Returns default tips
   - AI Pulse: Returns "not configured" message

---

## 📊 Quick Start

### Minimum Setup (Basic AI)

```env
OPENAI_API_KEY=sk-your-key-here
```

This enables: Lyrics, Mix, Mastering, AI Pulse

### Full Setup (All AI)

```env
# OpenAI (Primary)
OPENAI_API_KEY=sk-your-openai-key

# Claude (Backup)
ANTHROPIC_API_KEY=sk-ant-your-claude-key

# MusicGen (Beat Generation)
MUSICGEN_API_BASE=http://localhost:9100
```

---

## 🚀 Production Recommendations

1. **Use both OpenAI and Claude** for redundancy
2. **Set up MusicGen** on a GPU instance for real audio
3. **Monitor usage** with API logging
4. **Rate limit** to prevent abuse
5. **Cache responses** where appropriate

---

*PowerStream AI - Enterprise-grade music AI with graceful degradation*



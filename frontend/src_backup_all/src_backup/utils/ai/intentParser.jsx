// frontend/src/utils/ai/intent-parser.js
// Parses natural language into intent objects

export const parseIntent = (input) => {
  if (!input) return { intent: "unknown", confidence: 0 };

  const normalized = input.toLowerCase().trim();

  if (normalized.includes("open powerfeed")) {
    return { intent: "NAVIGATE_POWERFEED", confidence: 0.95 };
  }

  if (normalized.includes("start live stream")) {
    return { intent: "START_STREAM", confidence: 0.9 };
  }

  if (normalized.includes("enable override")) {
    return { intent: "ENABLE_OVERRIDE", confidence: 0.92 };
  }

  return { intent: "UNKNOWN", confidence: 0.4 };
};



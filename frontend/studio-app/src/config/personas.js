// frontend/studio-app/src/config/personas.js
// AI Artist Personas for No Limit East Houston

export const SCARFACE_20 = {
  id: "scarface20",
  name: "Scarface 2.0 — The Digital Don",
  station: "No Limit East Houston",
  description: "Pain rap, South Houston storytelling, baritone grit, vivid scenes.",
  avatar: "/avatars/scarface20.png",
  style: {
    genre: "street gospel meets pain rap",
    focus: ["delivery", "emotion", "storytelling clarity", "authenticity"],
  }
};

// Default persona for AI Coach
export const DEFAULT_PERSONA = SCARFACE_20;

// All available personas
export const PERSONAS = {
  scarface20: SCARFACE_20,
  // Add more personas here as we create them
};

// Get persona by ID
export function getPersona(id) {
  return PERSONAS[id] || DEFAULT_PERSONA;
}

// List all personas for dropdown
export function listPersonas() {
  return Object.values(PERSONAS);
}






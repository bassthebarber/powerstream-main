let memoryStore = {};

export const loadMemory = () => {
  console.log('🧠 Infinity Memory initialized.');
  memoryStore = {}; // Load from file or DB if needed
};

export const remember = (key, value) => {
  memoryStore[key] = value;
};

export const recall = (key) => {
  return memoryStore[key] || null;
};

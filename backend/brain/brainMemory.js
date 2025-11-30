// /backend/AI/Brain/brainMemory.js
let memory = {};

module.exports = {
    store(key, value) {
        memory[key] = value;
        console.log(`🧠 [BrainMemory] Stored: ${key}`);
    },
    recall(key) {
        return memory[key];
    },
    dump() {
        console.log("📦 [BrainMemory] Dumping memory:", memory);
        return memory;
    }
};

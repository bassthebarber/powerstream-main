// backend/controllers/controller.js

export const runCommand = async (req, res) => {
  const { input } = req.body;

  if (!input) return res.status(400).json({ error: "No input provided" });

  // Example: very basic interpretation
  if (input.includes("status")) {
    return res.json({ response: "System is fully operational, Commander." });
  }

  if (input.includes("activate override")) {
    return res.json({ response: "Infinity Override has been initiated." });
  }

  return res.json({ response: `I received your command: "${input}"` });
};

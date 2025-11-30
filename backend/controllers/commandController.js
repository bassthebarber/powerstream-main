// backend/controllers/commandController.js
export const handleCommandInput = async (req, res) => {
  try {
    const { command } = req.body;

    // Example: logging or triggering AI events
    console.log("🧠 Received Command:", command);

    // Send a signal to the Copilot or Circuit Board (if wired)
    const io = req.app.get("io");
    if (io) {
      io.emit("command_triggered", { command });
    }

    res.status(200).json({ message: "Command received", command });
  } catch (err) {
    console.error("Error handling command:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

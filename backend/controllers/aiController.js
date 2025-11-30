// backend/controllers/aiController.js

export async function handleAICommand(req, res) {
  try {
    const { command } = req.body;

    let response;

    switch (command?.toLowerCase()) {
      case "hello":
        response = "🧠 PowerStream AI at your service.";
        break;
      case "status":
        response = "✅ All systems are online and running perfectly.";
        break;
      case "fix layout":
        response = "🛠️ UI repair initiated. Animating components now.";
        break;
      default:
        response = `🤖 Command received: "${command}" — processing...`;
    }

    res.json({ success: true, message: response });
  } catch (error) {
    console.error("AI Command Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

import axios from "axios";

export async function generateMusic(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ ok: false, error: "prompt is required" });
    }

    console.log(`🎶 MusicGen requested: ${prompt}`);

    const HF_API_URL = process.env.MUSICGEN_MODEL_URL;
    const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

    if (!HF_API_URL || !HF_API_KEY) {
      return res.status(500).json({
        ok: false,
        error: "MusicGen is not fully configured (missing HuggingFace keys)"
      });
    }

    // Call HuggingFace Inference API
    const response = await axios.post(
      HF_API_URL,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer",
      }
    );

    // Send raw audio buffer
    res.setHeader("Content-Type", "audio/wav");
    return res.send(response.data);

  } catch (error) {
    console.error("MusicGen Error:", error?.message);
    res.status(500).json({
      ok: false,
      error: error?.response?.data || error.message,
    });
  }
}

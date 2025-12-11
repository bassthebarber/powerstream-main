import axios from "axios";

const MUSICGEN_API = process.env.MUSICGEN_API_URL || "http://127.0.0.1:9000";

export const generateBeat = async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await axios.post(
      `${MUSICGEN_API}/generate`,
      { prompt },
      { responseType: "arraybuffer" }
    );

    res.set("Content-Type", "audio/mpeg");
    return res.send(response.data);

  } catch (err) {
    console.error("MusicGen generation failed:", err.message);
    return res.status(500).json({ error: "Beat generation failed" });
  }
};

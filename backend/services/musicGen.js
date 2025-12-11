import axios from "axios";

const MUSICGEN_URL = process.env.MUSICGEN_URL || "http://127.0.0.1:9000";

export const generateMusic = async (prompt, melody = null) => {
    const payload = { prompt, melody };

    const res = await axios.post(`${MUSICGEN_URL}/generate`, payload, {
        responseType: "arraybuffer",
    });

    return res.data; // returns audio buffer
};

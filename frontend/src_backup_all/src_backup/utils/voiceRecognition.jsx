// frontend/src/utils/voiceRecognition.js
export default function startVoiceRecognition(onCommand) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn("Web Speech API not supported in this browser.");
    return () => {};
  }

  const recog = new SpeechRecognition();
  recog.lang = "en-US";
  recog.continuous = true;        // keep listening
  recog.interimResults = false;   // only final results

  const start = () => {
    try {
      recog.start();
      // console.log("🎤 Voice recognition started");
    } catch (e) {
      // start() throws if already started – ignore
    }
  };

  recog.onresult = (evt) => {
    const last = evt.results[evt.results.length - 1];
    if (!last || !last.isFinal) return;
    const transcript = (last[0]?.transcript || "").trim();
    if (transcript) onCommand(transcript);
  };

  recog.onerror = (e) => {
    console.warn("Voice recognition error:", e.error || e);
    // Auto-retry on harmless errors
    if (e.error === "no-speech" || e.error === "network" || e.error === "not-allowed") {
      setTimeout(start, 1000);
    }
  };

  recog.onend = () => {
    // Keep it running
    setTimeout(start, 300);
  };

  // Kickoff (user gesture helps get mic permission)
  start();

  // Stop function for cleanup
  return () => {
    try {
      recog.onresult = null;
      recog.onerror = null;
      recog.onend = null;
      recog.stop();
    } catch {}
  };
}



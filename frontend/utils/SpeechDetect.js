// frontend/src/utils/speech-detect.js
// Detects speech via Web Speech API

export const startSpeechDetection = (onResult, onError) => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError && onError("Speech Recognition not supported in this browser.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let transcript = "";
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcript += event.results[i][0].transcript;
    }
    onResult && onResult(transcript.trim());
  };

  recognition.onerror = (event) => {
    onError && onError(event.error);
  };

  recognition.start();
  return recognition;
};

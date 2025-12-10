import React, { useState } from "react";

const VoiceInputChat = ({ onVoiceSubmit }) => {
  const [transcript, setTranscript] = useState("");

  const handleVoiceInput = () => {
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      onVoiceSubmit(result);
    };
    recognition.start();
  };

  return (
    <div className="voice-input-chat">
      <button onClick={handleVoiceInput}>🎙️ Speak</button>
      <p>{transcript}</p>
    </div>
  );
};

export default VoiceInputChat;



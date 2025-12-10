import React, { useEffect, useRef, useState } from 'react';

const HandleVoiceChat = ({ onVoiceMessage }) => {
  const recognitionRef = useRef(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Your browser does not support Speech Recognition.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcriptChunk = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcriptChunk;
        } else {
          interimTranscript += transcriptChunk;
        }
      }

      setTranscript(finalTranscript || interimTranscript);

      if (finalTranscript && onVoiceMessage) {
        onVoiceMessage(finalTranscript);
        setTranscript('');
      }
    };

    recognitionRef.current = recognition;
  }, [onVoiceMessage]);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  return (
    <div style={{ marginTop: '10px' }}>
      <button onClick={isListening ? stopListening : startListening}>
        {isListening ? 'Stop Voice' : 'Start Voice'}
      </button>
      {transcript && <p style={{ color: 'gold' }}>🗣 {transcript}</p>}
    </div>
  );
};

export default HandleVoiceChat;



// VoiceControlHub.js
import SpeechRecognizer from '../ai/speechRecognizer';
import VoiceIntentMapper from '../ai/voiceIntentMapper';

class VoiceControlHub {
  start(onIntent) {
    console.log("🎙️ [VoiceControlHub] Starting voice recognition...");

    const recognition = SpeechRecognizer((spokenText) => {
      const intent = VoiceIntentMapper(spokenText);
      if (intent && onIntent) {
        onIntent(intent);
      }
    });

    if (recognition && recognition.start) {
      recognition.start();
    }
  }
}

export default new VoiceControlHub();



// frontend/src/utils/voice-utils.js
// Voice recording and playback helpers

export const recordAudio = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        resolve({ audioBlob, audioUrl });
      };

      mediaRecorder.start();
      resolve({ mediaRecorder, stop: () => mediaRecorder.stop() });
    } catch (err) {
      reject(err);
    }
  });
};

export const playAudio = (url) => {
  const audio = new Audio(url);
  audio.play();
};

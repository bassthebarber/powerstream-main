// frontend/src/studio/ui/RecordControls.js

import { waveformEngine } from "../engine/WaveformEngine";

export const handleRecordButton = (trackId) => {
  waveformEngine.startRecording(trackId);
};

export const handleStopRecord = () => {
  waveformEngine.stopRecording();
};

export const handlePlay = () => {
  waveformEngine.play();
};

export const handleStop = () => {
  waveformEngine.stop();
};

export const handleReset = () => {
  waveformEngine.reset();
};



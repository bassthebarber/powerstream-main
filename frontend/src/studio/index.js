// frontend/src/studio/index.js
// PowerStream Studio - Main Exports

// Engine
export { waveformEngine } from './engine/WaveformEngine';
export { masterExportEngine } from './engine/MasterExportEngine';
export { recordingEngine } from './engine/RecordingEngine';

// Audio Context
export { StudioAudioProvider, useStudioAudio } from './StudioAudioContext';

// Services
export { BeatService } from './services/BeatService';
export { RoyaltyService } from './services/RoyaltyService';

// UI Components
export {
  RecordingPanel,
  TrackStrip,
  MixerPanel,
  BeatGeneratorPanel,
  ExportPanel,
  RoyaltyDashboard,
  LibraryPanel,
  VisualizerPanel,
  RoyaltyPanel,
  RecordPanel,
  handleRecordButton,
  handleStopRecord,
  handlePlay,
  handleStop,
  handleReset,
} from './ui';

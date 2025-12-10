// backend/utils/logs/audioUploadLogger.js
import { saveSnapshot } from './SnapshotLogger.js';

export function logAudioUploadStart({ userId, filename, size }) {
  return saveSnapshot('audio_upload_start', {
    userId,
    filename,
    size,
    timestamp: new Date().toISOString(),
  });
}

export function logAudioUploadSuccess({ userId, audioId, title, duration, url, publicId }) {
  return saveSnapshot('audio_upload_success', {
    userId,
    audioId,
    title,
    duration,
    url,
    publicId,
    timestamp: new Date().toISOString(),
  });
}

export function logAudioUploadFail({ userId, filename, error }) {
  return saveSnapshot('audio_upload_error', {
    userId,
    filename,
    error: typeof error === 'string' ? error : error?.message,
    timestamp: new Date().toISOString(),
  });
}

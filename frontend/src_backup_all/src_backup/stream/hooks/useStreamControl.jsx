// frontend/hooks/UseStreamControl.js
import { useState } from 'react';

export default function useStreamControl() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const startStream = () => {
    console.log('Starting stream...');
    // Replace with API call to backend to start
    setIsStreaming(true);
  };

  const stopStream = () => {
    console.log('Stopping stream...');
    // Replace with API call to backend to stop
    setIsStreaming(false);
  };

  const muteMic = () => {
    console.log('Muting mic...');
    setIsMuted(true);
  };

  const unmuteMic = () => {
    console.log('Unmuting mic...');
    setIsMuted(false);
  };

  const switchCamera = () => {
    console.log('Switching camera...');
  };

  return {
    isStreaming,
    isMuted,
    startStream,
    stopStream,
    muteMic,
    unmuteMic,
    switchCamera,
  };
}



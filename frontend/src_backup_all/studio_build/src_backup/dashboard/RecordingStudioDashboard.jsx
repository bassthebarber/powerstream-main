// /frontend/src/components/recordingStudio/RecordingStudioDashboard.jsx
import React from 'react';
import BeatStore from '../BeatStore';
import UploadTrackForm from '../UploadTrackForm';
import MasterTrackVisualizer from '../MasterTrackVisualizer';
import StreamReadyPlayer from '../StreamReadyPlayer';
import useStudioSequence from '../sequenceHook';

export default function RecordingStudioDashboard({ userId }) {
  const studioReady = useStudioSequence(userId);

  return (
    <div className="studio-dashboard">
      <h2>🎧 PowerStream Studio</h2>
      {!studioReady && <p>Activating AI studio…</p>}
      {studioReady && (
        <>
          <BeatStore />
          <UploadTrackForm />
          <MasterTrackVisualizer />
          <StreamReadyPlayer />
        </>
      )}
    </div>
  );
}

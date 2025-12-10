// frontend/src/components/reel/ReelCard.js
import React from 'react';
import ReelPlayer from './ReelPlayer';

export default function ReelCard({ reel }) {
  return (
    <div className="reel-card bg-white dark:bg-black p-4 mb-4 rounded shadow-md">
      <h4 className="text-lg font-bold mb-2">{reel.title}</h4>
      <ReelPlayer videoUrl={reel.videoUrl} />
      <p className="text-sm text-gray-500 mt-2">{reel.description}</p>
    </div>
  );
}



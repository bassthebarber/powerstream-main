import React from 'react'

export default function AIPlayback() {
  return (
    <div className="text-yellow-400 text-center p-10">
      <h1 className="text-3xl font-bold mb-4">🎧 Playback</h1>
      <p>Here's your AI-enhanced track:</p>
      <audio controls className="mt-6">
        <source src="/studio-output/track.mp3" type="audio/mp3" />
        Your browser does not support audio playback.
      </audio>
    </div>
  )
}

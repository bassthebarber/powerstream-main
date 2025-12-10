// frontend/src/pages/studio/Dashboard.jsx
import React from 'react'
import { Link } from 'react-router-dom'
import StudioHeader from '../../components/studio/StudioHeader'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-black text-yellow-400">
      <StudioHeader />
      <div className="max-w-3xl mx-auto mt-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Your Studio</h1>
        <p className="mb-6">Upload your vocals or beats, then let the AI mix it down automatically.</p>

    <div className="space-x-4">
  <Link to="/studio/upload" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition">Upload</Link>
  <Link to="/studio/playback" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition">Playback</Link>
  <Link to="/studio/golive" className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600 transition">Go Live</Link>
</div>

      </div>
    </div>
  )
}

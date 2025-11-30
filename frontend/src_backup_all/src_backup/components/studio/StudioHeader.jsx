import React from 'react'
import { Link } from 'react-router-dom'
import './StudioHeader.css'

export default function StudioHeader() {
  return (
    <header className="studio-header bg-black text-yellow-400">
      <div className="text-2xl font-bold">
        🎙️ Southern Power and No Limit East Houston AI Studio
      </div>

      <nav className="flex justify-center space-x-6 mt-2">
        <Link to="/studio/dashboard" className="hover:text-white">Dashboard</Link>
        <Link to="/studio/upload" className="hover:text-white">Upload</Link>
        <Link to="/studio/playback" className="hover:text-white">Playback</Link>
        <Link to="/studio/logout" className="hover:text-white">Logout</Link>
      </nav>
    </header>
  )
}

import React, { useState } from 'react'
import axios from 'axios'

export default function UploadTrack() {
  const [file, setFile] = useState(null)
  const [status, setStatus] = useState('')

  const handleUpload = async () => {
    const formData = new FormData()
    formData.append('track', file)

    try {
      setStatus('Uploading...')
      await axios.post('/api/upload', formData)
      setStatus('Uploaded. Mixing in progress...')
      setTimeout(() => {
        setStatus('AI Mixing Complete. Ready for playback.')
      }, 3000)
    } catch (err) {
      setStatus('Upload failed.')
    }
  }

  return (
    <div className="text-yellow-400 p-8 text-center">
      <h1 className="text-2xl font-bold mb-4">Upload a Beat or Vocal</h1>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} className="mb-4" />
      <button onClick={handleUpload} className="bg-yellow-500 px-4 py-2 text-black font-bold rounded hover:bg-yellow-600">Upload</button>
      <p className="mt-4">{status}</p>
    </div>
  )
}

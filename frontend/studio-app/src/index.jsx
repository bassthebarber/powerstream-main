import React, { Suspense } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import StudioMenu from './StudioMenu';
import RecordPage from './RecordPage';
import BeatStorePage from './BeatStorePage';
import MixMasterPage from './MixMasterPage';
import UploadTrackPage from './UploadTrackPage';
import ExportEmailPage from './ExportEmailPage';
import SettingsPage from './SettingsPage';

export default function RecordingStudioPage() {
  return (
    <div className="min-h-screen bg-black text-yellow-400 p-6">
      <h1 className="text-4xl font-bold mb-4">🎧 PowerStream AI Studio</h1>
      <p className="opacity-80 mb-6">Create, record, mix, and master your tracks right inside the cloud.</p>

      <nav className="mb-8">
        <ul className="flex flex-wrap gap-4 text-lg">
          <li><Link to="/studio" className="hover:text-white">🏠 Menu</Link></li>
          <li><Link to="/studio/record" className="hover:text-white">🎙 Record</Link></li>
          <li><Link to="/studio/beats" className="hover:text-white">🎵 Beats</Link></li>
          <li><Link to="/studio/mix" className="hover:text-white">🎚 Mix</Link></li>
          <li><Link to="/studio/upload" className="hover:text-white">⬆ Upload</Link></li>
          <li><Link to="/studio/export" className="hover:text-white">📤 Export</Link></li>
          <li><Link to="/studio/settings" className="hover:text-white">⚙ Settings</Link></li>
        </ul>
      </nav>

      <Suspense fallback={<div className="opacity-80">Loading studio tools...</div>}>
        <Routes>
          <Route index element={<StudioMenu />} />
          <Route path="record" element={<RecordPage />} />
          <Route path="beats" element={<BeatStorePage />} />
          <Route path="mix" element={<MixMasterPage />} />
          <Route path="upload" element={<UploadTrackPage />} />
          <Route path="export" element={<ExportEmailPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Routes>
      </Suspense>
    </div>
  );
}

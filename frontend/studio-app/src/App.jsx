import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/theme.css";
import "./styles/studio.css";
import "./index.css"; // Gold button styles

// Context
import { StudioSessionProvider } from "./context/StudioSessionContext.jsx";

// UI
import TopNav from "./components/ui/TopNav.jsx";

// Pages
import SouthernPowerLanding from "./pages/SouthernPowerLanding.jsx";
import StudioHub from "./pages/StudioHub.jsx";
import RecordPage from "./pages/RecordPage.jsx";
import RecordBoot from "./pages/RecordBoot.jsx";
import MixMasterPage from "./pages/MixMasterPage.jsx";
import BeatStore from "./pages/BeatStore.jsx";
import BeatPlayer from "./pages/BeatPlayer.jsx";
import BeatLab from "./pages/BeatLab.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import ExportEmail from "./pages/ExportEmail.jsx";
import Royalty from "./pages/Royalty.jsx";
import Visualizer from "./pages/Visualizer.jsx";
import Settings from "./pages/Settings.jsx";
import Library from "./pages/Library.jsx";
import CoachAdmin from "./pages/CoachAdmin.jsx";
import VoiceStudio from "./pages/VoiceStudio.jsx";
import TVExports from "./pages/TVExports.jsx";
import AdminProducers from "./pages/AdminProducers.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <StudioSessionProvider>
      <TopNav />
      <Routes>
        {/* Southern Power Syndicate Landing - DEFAULT */}
        <Route path="/" element={<SouthernPowerLanding />} />
        
        {/* PowerHarmony Control Room */}
        <Route path="/studio" element={<StudioHub />} />
        
        {/* Recording */}
        <Route path="/record" element={<RecordPage />} />
        <Route path="/recordboot" element={<RecordBoot />} />
        <Route path="/record-booth" element={<RecordBoot />} />
        
        {/* Mix & Master */}
        <Route path="/mix" element={<MixMasterPage />} />
        
        {/* Beat Lab & Store */}
        <Route path="/beat-lab" element={<BeatLab />} />
        <Route path="/beats" element={<BeatStore />} />
        <Route path="/beat-store" element={<BeatStore />} />
        <Route path="/player" element={<BeatPlayer />} />
        
        {/* File Management */}
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/library" element={<Library />} />
        
        {/* Export & Email */}
        <Route path="/export" element={<ExportEmail />} />
        
        {/* Business & Royalty */}
        <Route path="/royalty" element={<Royalty />} />
        
        {/* Visualization */}
        <Route path="/visualizer" element={<Visualizer />} />
        
        {/* Settings & Admin */}
        <Route path="/settings" element={<Settings />} />
        <Route path="/coach-admin" element={<CoachAdmin />} />
        
        {/* AI Voice Studio */}
        <Route path="/voice-studio" element={<VoiceStudio />} />
        <Route path="/voice" element={<VoiceStudio />} />
        
        {/* TV Streaming Exports */}
        <Route path="/tv-exports" element={<TVExports />} />
        <Route path="/tv" element={<TVExports />} />
        
        {/* Admin Dashboard */}
        <Route path="/admin/producers" element={<AdminProducers />} />
        
        {/* Fallback - Show 404 instead of redirecting */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </StudioSessionProvider>
    </BrowserRouter>
  );
}

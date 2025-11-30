import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/theme.css";

// UI
import TopNav from "./components/ui/TopNav.jsx";

// Pages
import StudioHub from "./pages/StudioHub.jsx";
import RecordPage from "./pages/RecordPage.jsx";
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

export default function App() {
  return (
    <BrowserRouter>
      <TopNav />
      <Routes>
        <Route path="/" element={<StudioHub />} />
        <Route path="/record" element={<RecordPage />} />
        <Route path="/mix" element={<MixMasterPage />} />
        <Route path="/beats" element={<BeatStore />} />
        <Route path="/player" element={<BeatPlayer />} />
        <Route path="/beat-lab" element={<BeatLab />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/export" element={<ExportEmail />} />
        <Route path="/royalty" element={<Royalty />} />
        <Route path="/visualizer" element={<Visualizer />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/library" element={<Library />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

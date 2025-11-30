Write-Host "🛠️ PowerStream UI Restore Started..." -ForegroundColor Cyan

# Clean environment
Write-Host "🧹 Cleaning node_modules and lock file..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json

# Clean cache
npm cache clean --force

# Reinstall core UI packages
Write-Host "📦 Reinstalling UI dependencies..." -ForegroundColor Magenta
npm install vite@5.2.10 react@18.2.0 react-dom@18.2.0 react-router-dom@6.22.3

# Ensure PowerStream UI files are restored
Write-Host "🧩 Verifying core component files..." -ForegroundColor Green

# --- Inject default App structure if missing ---
$appFile = "src\App.jsx"
if (-Not (Test-Path $appFile)) {
    Write-Host "⚠️ Missing App.jsx — injecting default layout..." -ForegroundColor Red
@"
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './components/Welcome/Welcome';
import PowerFeed from './components/PowerFeed/Launcher';
import PowerGram from './components/PowerGram/PowerGram';
import PowerReels from './components/PowerReels/GlobalReels';
import PowerLine from './components/PowerLine/GroupCallPanel';
import Header from './components/Header/Header';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/feed" element={<PowerFeed />} />
        <Route path="/gram" element={<PowerGram />} />
        <Route path="/reel" element={<PowerReels />} />
        <Route path="/line" element={<PowerLine />} />
      </Routes>
    </Router>
  );
}

export default App;
"@ | Out-File -Encoding utf8 -FilePath $appFile
}

# --- Inject main.jsx ---
$mainFile = "src\main.jsx"
if (-Not (Test-Path $mainFile)) {
    Write-Host "⚠️ Missing main.jsx — injecting entry point..." -ForegroundColor Red
@"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@ | Out-File -Encoding utf8 -FilePath $mainFile
}

# Rebuild frontend
Write-Host "🔁 Rebuilding PowerStream frontend..." -ForegroundColor Cyan
npm run dev

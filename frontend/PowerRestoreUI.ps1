# PowerRestoreUI.ps1
# Restores PowerStream frontend UI with base routes and homepage

Write-Host "🚀 PowerRestoreUI starting..." -ForegroundColor Cyan

# 1. Ensure dependencies
pnpm install

# 2. Restore Tailwind config
$tailwindConfig = @"
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: "#F7C948",
        black: "#000000",
      },
    },
  },
  plugins: [],
}
"@
Set-Content "tailwind.config.js" $tailwindConfig

# 3. Ensure index.css
$indexCss = @"
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-black text-gold;
  font-family: system-ui, sans-serif;
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin-slow { animation: spin-slow 20s linear infinite; }
"@
Set-Content "src\index.css" $indexCss

# 4. Restore App.jsx with homepage + routes
$appCode = @"
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function Home() {
  return (
    <div className='min-h-screen bg-black text-gold flex flex-col items-center justify-center text-center'>
      <img src='/logos/powerstream-logo.png' alt='PowerStream Logo' className='w-40 h-40 animate-spin-slow mb-6' />
      <h1 className='text-5xl font-bold'>PowerStream</h1>
      <nav className='flex gap-6 mt-8 text-xl underline'>
        <Link to='/feed'>PowerFeed</Link>
        <Link to='/line'>PowerLine</Link>
        <Link to='/gram'>PowerGram</Link>
        <Link to='/reel'>PowerReel</Link>
        <Link to='/tv'>TV Stations</Link>
      </nav>
    </div>
  );
}

function Placeholder({ title }) {
  return <div className='p-10 text-3xl text-gold bg-black min-h-screen'>{title} Page</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/feed' element={<Placeholder title='PowerFeed' />} />
        <Route path='/line' element={<Placeholder title='PowerLine' />} />
        <Route path='/gram' element={<Placeholder title='PowerGram' />} />
        <Route path='/reel' element={<Placeholder title='PowerReel' />} />
        <Route path='/tv' element={<Placeholder title='TV Stations' />} />
      </Routes>
    </BrowserRouter>
  );
}
"@
Set-Content "src\App.jsx" $appCode

# 5. Ensure main.jsx exists
$mainCode = @"
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"@
Set-Content "src\main.jsx" $mainCode

# 6. Start dev server
Write-Host "✅ UI restored. Starting dev server..." -ForegroundColor Green
pnpm dev

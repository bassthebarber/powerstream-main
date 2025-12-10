// src/pages/studio/StudioLogin.jsx
import React from 'react';

export default function StudioLogin() {
  return (
    <div className="text-center mt-32 text-white">
      <h1>🎙️ Artist Login</h1>
      <form className="mt-6 space-y-4">
        <input type="email" placeholder="Email" className="px-4 py-2 bg-black border border-yellow-500 text-white" />
        <input type="password" placeholder="Password" className="px-4 py-2 bg-black border border-yellow-500 text-white" />
        <button className="bg-yellow-500 px-6 py-2 text-black font-bold">Login</button>
      </form>
    </div>
  );
}

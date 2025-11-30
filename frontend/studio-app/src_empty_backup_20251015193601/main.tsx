import { createRoot } from "react-dom/client";
import React from "react";
import "./index.css";

function App() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">AI Recording Studio</h1>
      <p className="text-lg">Record, mix, master, and create — all in one place.</p>
      <button className="bg-yellow-400 text-black px-6 py-3 rounded">
        Launch Studio Console
      </button>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<App />);

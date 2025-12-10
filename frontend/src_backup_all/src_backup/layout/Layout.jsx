import React from "react";
import { NavLink } from "react-router-dom";
import CopilotConsole from "@/components/CopilotConsole.jsx";

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          {/* Make sure /public/logos/powerstream-logo.png exists */}
          <img src="/logos/powerstream-logo.png" alt="PowerStream Logo" />
          <span>PowerStream</span>
        </div>
        <nav className="nav">
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/gram">Gram</NavLink>
          <NavLink to="/reel">Reel</NavLink>
          <NavLink to="/network">Network</NavLink>
          <NavLink to="/signin">Sign In</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </header>

      <main className="page">
        {children}
      </main>

      {/* Copilot command console (always visible at bottom) */}
      <CopilotConsole />
    </div>
  );
}



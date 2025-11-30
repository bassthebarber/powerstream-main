import React from "react";
import { NavLink } from "react-router-dom";
import { IMAGES } from "@/config/images\.jsx";

export default function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="brand" style={{ gap: 10 }}>
          <img
            className="spin"
            src={IMAGES.brand}
            alt="PowerStream"
            width="28"
            height="28"
            style={{ objectFit: "contain" }}
          />
          <span style={{ fontWeight: 800 }}>PowerStream</span>
        </div>

        <nav className="nav" style={{ marginLeft: 16 }}>
          <NavLink to="/home">Home</NavLink>
          <NavLink to="/feed">Feed</NavLink>
          <NavLink to="/gram">Gram</NavLink>
          <NavLink to="/reel">Reel</NavLink>
          <NavLink to="/network">Network</NavLink>
          <NavLink to="/signin">Sign In</NavLink>
          <NavLink to="/register">Register</NavLink>
        </nav>
      </header>

      <main className="container">{children}</main>
    </div>
  );
}



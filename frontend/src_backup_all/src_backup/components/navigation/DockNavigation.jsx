import React from 'react';
import { NavLink } from 'react-router-dom';

const DockNavigation = () => (
  <nav className="dock-nav">
    <NavLink to="/feed">Feed</NavLink>
    <NavLink to="/gram">Gram</NavLink>
    <NavLink to="/reel">Reel</NavLink>
    <NavLink to="/tv">TV</NavLink>
    <NavLink to="/line">Messages</NavLink>
  </nav>
);

export default DockNavigation;



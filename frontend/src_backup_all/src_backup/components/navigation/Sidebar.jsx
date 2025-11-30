import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css'; // Optional: Only if you are using a Sidebar.css file

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>🌟 PowerStream</h2>
      <nav className="sidebar-nav">
        <NavLink to="/feed" activeClassName="active-link">
          📰 PowerFeed
        </NavLink>
        <NavLink to="/gram" activeClassName="active-link">
          📸 PowerGram
        </NavLink>
        <NavLink to="/reel" activeClassName="active-link">
          🎥 PowerReel
        </NavLink>
        <NavLink to="/tv" activeClassName="active-link">
          📺 TV Stations
        </NavLink>
        <NavLink to="/powerline" activeClassName="active-link">
          📞 PowerLine
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;



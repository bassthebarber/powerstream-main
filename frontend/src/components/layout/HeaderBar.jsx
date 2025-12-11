// frontend/src/components/layout/HeaderBar.jsx
// Global header bar per Overlord Spec
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import "./layout.css";

export default function HeaderBar() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Determine section for logo
  const getLogoText = () => {
    if (location.pathname.startsWith("/powerfeed")) return "PowerFeed";
    if (location.pathname.startsWith("/powergram")) return "PowerGram";
    if (location.pathname.startsWith("/powerreel")) return "PowerReel";
    if (location.pathname.startsWith("/powerline")) return "PowerLine";
    if (location.pathname.startsWith("/tv")) return "PowerStream TV";
    return "PowerStream";
  };
  
  return (
    <header className="ps-header-bar">
      <div className="ps-header-left">
        <Link to="/" className="ps-header-logo">
          <span className="ps-logo-icon">⚡</span>
          <span className="ps-logo-text">{getLogoText()}</span>
        </Link>
      </div>
      
      <div className="ps-header-center">
        <div className="ps-search-bar">
          <span className="ps-search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Ask PowerStream..." 
            className="ps-search-input"
          />
        </div>
      </div>
      
      <div className="ps-header-right">
        {user ? (
          <>
            <div className="ps-header-coins" title="Coin Balance">
              <span className="ps-coin-icon">🪙</span>
              <span className="ps-coin-amount">{user.coinsBalance || 0}</span>
            </div>
            
            <Link to="/powerline" className="ps-header-action" title="Messages">
              ⚡
            </Link>
            
            <button className="ps-header-action" title="Notifications">
              🔔
            </button>
            
            <Link to="/profile" className="ps-header-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} />
              ) : (
                <span>{user.name?.charAt(0) || "U"}</span>
              )}
            </Link>
          </>
        ) : (
          <Link to="/login" className="ps-header-login">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}



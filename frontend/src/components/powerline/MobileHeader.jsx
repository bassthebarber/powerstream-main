import React from "react";

export default function MobileHeader({ onBack, user }) {
  return (
    <div className="pl-mobile-header">
      <button className="pl-back-btn" onClick={onBack}>←</button>
      <img src={user?.avatar} className="pl-mobile-avatar" alt="" />
      <span className="pl-mobile-name">{user?.name}</span>
    </div>
  );
}



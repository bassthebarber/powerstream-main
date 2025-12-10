import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function LogoutButton({ children, className = "" }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await signOut();
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <button type="button" onClick={handleClick} className={className}>
      {children || "Sign Out"}
    </button>
  );
}







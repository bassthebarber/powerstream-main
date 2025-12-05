import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="ps-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <div style={{ textAlign: "center", color: "#e6b800" }}>
          <div style={{ fontSize: "24px", marginBottom: "12px" }}>⚡</div>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Check admin requirement if specified
  if (requireAdmin && !user.isAdmin && user.role !== "admin") {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location, error: "Admin access required" }}
      />
    );
  }

  return children;
};

export default ProtectedRoute;

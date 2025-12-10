import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * withAuth - Higher Order Component for protecting routes
 * 
 * Usage:
 *   const ProtectedPage = withAuth(MyPage);
 *   // or with admin requirement:
 *   const AdminPage = withAuth(MyPage, { requireAdmin: true });
 * 
 * Redirects to /login if no valid token/user is found.
 */
export function withAuth(WrappedComponent, options = {}) {
  const { requireAdmin = false } = options;

  return function AuthenticatedComponent(props) {
    const location = useLocation();
    const { user, loading } = useAuth();

    // Show loading state while checking auth
    if (loading) {
      return (
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#000",
            color: "#e6b800",
          }}
        >
          <div style={{ textAlign: "center" }}>
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

    // Render the wrapped component
    return <WrappedComponent {...props} />;
  };
}

/**
 * useRequireAuth - Hook version for functional components
 * 
 * Usage:
 *   function MyProtectedPage() {
 *     const { user, redirecting } = useRequireAuth();
 *     if (redirecting) return null;
 *     return <div>Welcome {user.name}</div>;
 *   }
 */
export function useRequireAuth(options = {}) {
  const { requireAdmin = false, redirectTo = "/login" } = options;
  const location = useLocation();
  const { user, loading } = useAuth();

  // Determine if we need to redirect
  const shouldRedirect = !loading && !user;
  const shouldRedirectAdmin = !loading && user && requireAdmin && 
    !user.isAdmin && user.role !== "admin";

  return {
    user,
    loading,
    redirecting: shouldRedirect || shouldRedirectAdmin,
    RedirectComponent: shouldRedirect ? (
      <Navigate to={redirectTo} replace state={{ from: location }} />
    ) : shouldRedirectAdmin ? (
      <Navigate to="/" replace state={{ from: location, error: "Admin access required" }} />
    ) : null,
  };
}

export default withAuth;




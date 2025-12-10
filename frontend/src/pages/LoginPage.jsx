import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

/**
 * LoginPage - PowerStream authentication login page
 * - Email/password inputs
 * - Submit to backend /auth/login
 * - On success: save token → redirect to /feed or previous location
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect destination after login (default to /powerfeed)
  const from = location.state?.from?.pathname || "/powerfeed";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      // Redirect to previous page or feed
      navigate(from, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
      
      // Determine the best error message to show
      let message;
      
      if (err.isNetworkError || err.code === "ERR_NETWORK" || err.message === "Network Error") {
        // Network connectivity issue
        message = "Unable to connect to PowerStream. Please ensure the server is running and try again.";
      } else if (err.response?.status === 401) {
        // Invalid credentials
        message = err.response?.data?.message || "Invalid email or password.";
      } else if (err.response?.status === 400) {
        // Bad request (missing fields, etc.)
        message = err.response?.data?.message || "Please check your email and password.";
      } else if (err.response?.status >= 500) {
        // Server error
        message = "Server error. Please try again in a moment.";
      } else {
        // Fallback
        message =
          err.response?.data?.message ||
          err.message ||
          "Login failed. Please check your credentials.";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* PowerStream Logo */}
        <div style={styles.logoContainer}>
          <img
            src="/logos/powerstream-logo.png"
            alt="PowerStream"
            style={styles.logo}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Title */}
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Sign in to continue to PowerStream</p>

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer Links */}
        <div style={styles.footer}>
          <span>Don't have an account?</span>
          <Link to="/register" style={styles.link}>
            Sign Up
          </Link>
        </div>

        {/* Forgot Password Link */}
        <div style={styles.forgotPassword}>
          <Link to="/forgot-password" style={styles.linkMuted}>
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    background: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    borderRadius: "16px",
    padding: "40px 32px",
    boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "24px",
  },
  logo: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
    animation: "spin 8s linear infinite",
  },
  title: {
    fontSize: "28px",
    fontWeight: "900",
    background: "linear-gradient(90deg, #ffb84d, #ffda5c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    textAlign: "center",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#888",
    textAlign: "center",
    marginBottom: "24px",
    fontSize: "14px",
  },
  error: {
    background: "rgba(255, 0, 0, 0.1)",
    border: "1px solid rgba(255, 0, 0, 0.3)",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    color: "#ff6b6b",
    fontSize: "14px",
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    fontSize: "13px",
    color: "#fff",
    fontWeight: "600",
  },
  input: {
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(255, 255, 255, 0.12)",
    background: "rgba(255, 255, 255, 0.04)",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: "8px",
    border: "none",
    background: "linear-gradient(135deg, #ffb84d, #e6a000)",
    color: "#000",
    fontSize: "16px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    transition: "all 0.2s ease",
  },
  footer: {
    marginTop: "24px",
    textAlign: "center",
    color: "#888",
    fontSize: "14px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "6px",
  },
  link: {
    color: "#ffb84d",
    textDecoration: "none",
    fontWeight: "600",
  },
  forgotPassword: {
    marginTop: "12px",
    textAlign: "center",
  },
  linkMuted: {
    color: "#666",
    textDecoration: "none",
    fontSize: "13px",
  },
};

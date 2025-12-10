import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api.js";

/**
 * ForgotPasswordPage - Request password reset email
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
    } catch (err) {
      console.error("Forgot password error:", err);
      // Don't reveal if email exists or not for security
      // Always show success message
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✉️</div>
          <h1 style={styles.title}>Check Your Email</h1>
          <p style={styles.message}>
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset link shortly.
          </p>
          <Link to="/login" style={styles.backButton}>
            ← Back to Login
          </Link>
        </div>
      </div>
    );
  }

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

        <h1 style={styles.title}>Reset Password</h1>
        <p style={styles.subtitle}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email Address
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

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            ← Back to Login
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
    textAlign: "center",
  },
  logoContainer: {
    marginBottom: "24px",
  },
  logo: {
    width: "80px",
    height: "80px",
    objectFit: "contain",
  },
  successIcon: {
    fontSize: "64px",
    marginBottom: "16px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "900",
    background: "linear-gradient(90deg, #ffb84d, #ffda5c)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
  },
  subtitle: {
    color: "#888",
    marginBottom: "24px",
    fontSize: "14px",
    lineHeight: "1.5",
  },
  message: {
    color: "#ccc",
    marginBottom: "24px",
    fontSize: "14px",
    lineHeight: "1.6",
  },
  error: {
    background: "rgba(255, 0, 0, 0.1)",
    border: "1px solid rgba(255, 0, 0, 0.3)",
    borderRadius: "8px",
    padding: "12px",
    marginBottom: "16px",
    color: "#ff6b6b",
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    textAlign: "left",
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
  },
  backButton: {
    display: "inline-block",
    padding: "12px 24px",
    background: "rgba(255, 184, 77, 0.1)",
    border: "1px solid rgba(255, 184, 77, 0.3)",
    borderRadius: "8px",
    color: "#ffb84d",
    textDecoration: "none",
    fontWeight: "600",
  },
  footer: {
    marginTop: "24px",
  },
  link: {
    color: "#ffb84d",
    textDecoration: "none",
    fontWeight: "600",
  },
};

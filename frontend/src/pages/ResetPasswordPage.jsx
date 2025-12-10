import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabaseClient.js";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validSession, setValidSession] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if we have a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setValidSession(true);
      } else {
        // Try to get session from URL hash (Supabase redirect)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        if (accessToken) {
          setValidSession(true);
        } else {
          setError("Invalid or expired reset link. Please request a new one.");
        }
      }
    };
    checkSession();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 900,
              background: "linear-gradient(90deg, #f5b301, #ffda5c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px",
            }}
          >
            Password Updated
          </h1>
          <p style={{ color: "#888", marginBottom: "24px" }}>
            Your password has been successfully reset. Redirecting to login...
          </p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#f5b301",
              color: "#000",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 700,
            }}
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (!validSession && error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "400px",
            background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 900,
              background: "linear-gradient(90deg, #f5b301, #ffda5c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "16px",
            }}
          >
            Invalid Link
          </h1>
          <p style={{ color: "#ff6b6b", marginBottom: "24px" }}>{error}</p>
          <Link
            to="/login"
            style={{
              display: "inline-block",
              padding: "12px 24px",
              background: "#f5b301",
              color: "#000",
              textDecoration: "none",
              borderRadius: "8px",
              fontWeight: 700,
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "linear-gradient(135deg, #1a1a1f 0%, #0f0f12 100%)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          padding: "32px",
        }}
      >
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 900,
            background: "linear-gradient(90deg, #f5b301, #ffda5c)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: "8px",
            textAlign: "center",
          }}
        >
          Reset Password
        </h1>
        <p style={{ color: "#888", textAlign: "center", marginBottom: "32px" }}>
          Enter your new password
        </p>

        {error && (
          <div
            style={{
              background: "rgba(255, 0, 0, 0.1)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "20px",
              color: "#ff6b6b",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                color: "#fff",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
              }}
              placeholder="••••••••"
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                color: "#fff",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
              }}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !validSession}
            style={{
              width: "100%",
              padding: "12px",
              background: loading || !validSession ? "#666" : "#f5b301",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading || !validSession ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              marginBottom: "16px",
            }}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p style={{ textAlign: "center", color: "#888", fontSize: "14px" }}>
          <Link
            to="/login"
            style={{ color: "#f5b301", textDecoration: "none", fontWeight: 600 }}
          >
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}











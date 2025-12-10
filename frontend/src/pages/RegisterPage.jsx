import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import api from "../lib/api.js";

/**
 * RegisterPage - PowerStream user registration page
 * - Name, email, password inputs
 * - Optional avatar upload
 * - POST to backend /auth/register
 * - On success: save token → redirect to /feed
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password strength
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Register the user
      await signUp(email, password, name);

      // If avatar was selected, upload it after registration
      if (avatar) {
        try {
          const formData = new FormData();
          formData.append("avatar", avatar);
          await api.post("/users/me/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (avatarErr) {
          console.warn("Avatar upload failed:", avatarErr.message);
          // Don't fail registration if avatar upload fails
        }
      }

      // Redirect to feed
      navigate("/powerfeed", { replace: true });
    } catch (err) {
      console.error("Registration error:", err);
      const message =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
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
        <h1 style={styles.title}>Join PowerStream</h1>
        <p style={styles.subtitle}>Create your account to get started</p>

        {/* Error Message */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Avatar Upload */}
          <div style={styles.avatarSection}>
            <label style={styles.avatarLabel}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                style={styles.avatarInput}
              />
              <div style={styles.avatarPreview}>
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    style={styles.avatarImage}
                  />
                ) : (
                  <span style={styles.avatarPlaceholder}>📷</span>
                )}
              </div>
              <span style={styles.avatarText}>Add Photo</span>
            </label>
          </div>

          <label style={styles.label}>
            Display Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
              autoComplete="name"
              style={styles.input}
            />
          </label>

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
              autoComplete="new-password"
              minLength={6}
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Confirm Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Terms */}
        <p style={styles.terms}>
          By signing up, you agree to our{" "}
          <Link to="/terms" style={styles.termsLink}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" style={styles.termsLink}>
            Privacy Policy
          </Link>
        </p>

        {/* Footer Links */}
        <div style={styles.footer}>
          <span>Already have an account?</span>
          <Link to="/login" style={styles.link}>
            Sign In
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
  avatarSection: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "8px",
  },
  avatarLabel: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  avatarInput: {
    display: "none",
  },
  avatarPreview: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    background: "rgba(255, 184, 77, 0.1)",
    border: "2px dashed rgba(255, 184, 77, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    transition: "all 0.2s ease",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarPlaceholder: {
    fontSize: "28px",
  },
  avatarText: {
    color: "#ffb84d",
    fontSize: "12px",
    fontWeight: "600",
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
  terms: {
    marginTop: "16px",
    textAlign: "center",
    color: "#666",
    fontSize: "12px",
    lineHeight: "1.5",
  },
  termsLink: {
    color: "#888",
    textDecoration: "underline",
  },
  footer: {
    marginTop: "20px",
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
};

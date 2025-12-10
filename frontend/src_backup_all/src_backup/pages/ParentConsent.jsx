// src/pages/ParentConsent.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { setParentConsent } from "../utils/policy";

export default function ParentConsent() {
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");

  const submit = (e) => {
    e.preventDefault();
    // This is a simple placeholder – real verification should be server-backed.
    setParentConsent();
    nav("/feed", { replace: true });
  };

  return (
    <div style={{ color: "#d4af37", padding: 24, maxWidth: 650, margin: "0 auto" }}>
      <h1>Parent / Guardian Consent</h1>
      <p style={{ color: "#ddd" }}>
        A parent or legal guardian must consent for minors to use PowerStream.
        Enter a parent/guardian email and confirm consent.
      </p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={{ display: "block", color: "#ccc", marginBottom: 8 }}>
          Parent/Guardian Email (optional for now)
        </label>
        <input
          type="email"
          placeholder="parent@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #444",
            background: "#0f0f0f",
            color: "#eee",
            width: "100%",
            maxWidth: 420,
          }}
        />
        <div style={{ marginTop: 16 }}>
          <label style={{ color: "#ddd" }}>
            <input type="checkbox" required style={{ marginRight: 8 }} /> I am the parent or legal
            guardian and I consent to this child using PowerStream.
          </label>
        </div>
        <div style={{ marginTop: 16 }}>
          <button
            type="submit"
            style={{
              padding: "10px 16px",
              background: "#d4af37",
              color: "#000",
              fontWeight: 700,
              border: 0,
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            I Consent
          </button>
        </div>
      </form>
    </div>
  );
}



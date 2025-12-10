// src/pages/AgeGate.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { MIN_AGE, setDobISO, isOldEnough } from "../utils/policy";

export default function AgeGate() {
  const nav = useNavigate();
  const [dob, setDob] = React.useState(""); // YYYY-MM-DD
  const [err, setErr] = React.useState("");

  const submit = (e) => {
    e.preventDefault();
    setErr("");
    if (!setDobISO(dob)) {
      setErr("Please enter a valid date.");
      return;
    }
    const ok = isOldEnough();
    if (ok === true) {
      nav("/feed", { replace: true });
    } else if (ok === false) {
      nav("/parent-consent", { replace: true });
    } else {
      setErr("Could not determine age. Try again.");
    }
  };

  return (
    <div style={{ color: "#d4af37", padding: 24, maxWidth: 600, margin: "0 auto" }}>
      <h1>Age Verification</h1>
      <p style={{ color: "#ddd" }}>
        For safety, you must be at least <b>{MIN_AGE}</b> years old, or have a parent/guardian’s consent.
      </p>
      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={{ display: "block", color: "#ccc", marginBottom: 8 }}>
          Date of birth
        </label>
        <input
          type="date"
          required
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          style={{
            padding: 10,
            borderRadius: 8,
            border: "1px solid #444",
            background: "#0f0f0f",
            color: "#eee",
          }}
        />
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
            Continue
          </button>
        </div>
        {err ? <div style={{ color: "#ff8686", marginTop: 12 }}>{err}</div> : null}
      </form>
    </div>
  );
}



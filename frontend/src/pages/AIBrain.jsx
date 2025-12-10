import React, { useState } from "react";
import api from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function AIBrain() {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState("");
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!command.trim()) return;

    setLoading(true);
    setError("");
    setResponse(null);

    try {
      // Try copilot endpoint first
      const res = await api.post("/copilot/command", {
        command: command.trim(),
        userId: user?.id,
      });

      if (res.data) {
        setResponse(res.data);
      }
    } catch (err) {
      // Fallback to commands endpoint
      try {
        const res = await api.post("/commands/run", {
          command: command.trim(),
          userId: user?.id,
        });
        if (res.data) {
          setResponse(res.data);
        }
      } catch (err2) {
        setError(err2.response?.data?.message || "Command failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHealthCheck = async () => {
    try {
      const res = await api.get("/brain/health");
      setResponse({ status: "healthy", data: res.data });
    } catch (err) {
      setError("Brain health check failed");
    }
  };

  return (
    <div className="ps-page">
      <h1>AI Brain & Control Tower</h1>
      <p className="ps-subtitle">Voice commands and system control</p>

      <div className="ps-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <button
            onClick={handleHealthCheck}
            style={{
              padding: "8px 16px",
              background: "var(--gold)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              marginBottom: "16px",
            }}
          >
            Check System Health
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: 600 }}>
              Command
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="e.g., 'go to PowerFeed', 'check backend health', 'refresh auth state'"
              style={{
                width: "100%",
                padding: "12px",
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "14px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !command.trim()}
            style={{
              width: "100%",
              padding: "12px",
              background: loading ? "#666" : "var(--gold)",
              color: "#000",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Processing..." : "Execute Command"}
          </button>
        </form>

        {error && (
          <div
            style={{
              marginTop: "20px",
              padding: "12px",
              background: "rgba(255, 0, 0, 0.1)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              borderRadius: "8px",
              color: "#ff6b6b",
            }}
          >
            {error}
          </div>
        )}

        {response && (
          <div
            style={{
              marginTop: "20px",
              padding: "16px",
              background: "rgba(0, 255, 0, 0.1)",
              border: "1px solid rgba(0, 255, 0, 0.3)",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "8px", color: "var(--gold)" }}>Response:</h3>
            <pre
              style={{
                color: "#fff",
                fontSize: "13px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.05)", borderRadius: "8px" }}>
          <h4 style={{ marginBottom: "8px", color: "var(--gold)" }}>Example Commands:</h4>
          <ul style={{ margin: 0, paddingLeft: "20px", color: "var(--muted)", fontSize: "13px" }}>
            <li>"go to PowerFeed"</li>
            <li>"check backend health"</li>
            <li>"ping database"</li>
            <li>"refresh auth state"</li>
            <li>"rebuild navigation menu"</li>
          </ul>
        </div>
      </div>
    </div>
  );
}







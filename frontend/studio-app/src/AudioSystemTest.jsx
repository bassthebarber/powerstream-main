// frontend/studio-app/src/AudioSystemTest.jsx
// Browser test page for verifying all audio subsystems
// Navigate to /audio-test to run these tests

import { useState, useEffect, useRef } from "react";
import useAudioMonitor from "./hooks/useAudioMonitor.js";
import useAudioRecorder from "./hooks/useAudioRecorder.js";
import { normalizeAudioUrl, validateAudioUrl, BeatPlayer } from "./services/beatPlayerService.js";

const STUDIO_API = import.meta.env.VITE_STUDIO_API_URL || "http://localhost:5100";

export default function AudioSystemTest() {
  const [testResults, setTestResults] = useState([]);
  const [running, setRunning] = useState(false);
  
  // Hooks
  const monitor = useAudioMonitor();
  const recorder = useAudioRecorder();
  
  const addResult = (name, status, details = "") => {
    setTestResults(prev => [...prev, { name, status, details, time: new Date().toISOString() }]);
  };
  
  const runAllTests = async () => {
    setRunning(true);
    setTestResults([]);
    
    // Test 1: AudioContext initialization
    try {
      await monitor.initAudioContext();
      addResult("AudioContext Init", "✅ PASS", "AudioContext created successfully");
    } catch (err) {
      addResult("AudioContext Init", "❌ FAIL", err.message);
    }
    
    // Test 2: Microphone access
    try {
      const hasAccess = await monitor.requestMicAccess();
      addResult("Microphone Access", hasAccess ? "✅ PASS" : "❌ FAIL", hasAccess ? "Mic access granted" : "Mic access denied");
    } catch (err) {
      addResult("Microphone Access", "❌ FAIL", err.message);
    }
    
    // Test 3: Audio monitoring start/stop
    try {
      await monitor.startMonitoring();
      await new Promise(r => setTimeout(r, 500));
      const wasMonitoring = monitor.isMonitoring;
      monitor.stopMonitoring();
      addResult("Audio Monitoring", wasMonitoring ? "✅ PASS" : "❌ FAIL", wasMonitoring ? "Monitoring started/stopped successfully" : "Monitoring failed to start");
    } catch (err) {
      addResult("Audio Monitoring", "❌ FAIL", err.message);
    }
    
    // Test 4: Beat endpoint health
    try {
      const res = await fetch(`${STUDIO_API}/api/studio/ai/health`);
      const data = await res.json();
      addResult("Beat Engine Health", data.ok ? "✅ PASS" : "⚠️ WARN", `Version: ${data.version}, AI: ${data.aiConfigured ? "Configured" : "Fallback mode"}`);
    } catch (err) {
      addResult("Beat Engine Health", "❌ FAIL", err.message);
    }
    
    // Test 5: Mix endpoint health
    try {
      const res = await fetch(`${STUDIO_API}/api/mix/health`);
      const data = await res.json();
      addResult("Mix Engine Health", data.ok ? "✅ PASS" : "❌ FAIL", `FFmpeg: ${data.ffmpegAvailable ? "Available" : "Not available"}, Cloudinary: ${data.cloudinaryConfigured ? "Configured" : "Not configured"}`);
    } catch (err) {
      addResult("Mix Engine Health", "❌ FAIL", err.message);
    }
    
    // Test 6: Master endpoint health
    try {
      const res = await fetch(`${STUDIO_API}/api/studio/master/health`);
      const data = await res.json();
      addResult("Master Engine Health", data.ok ? "✅ PASS" : "❌ FAIL", `FFmpeg: ${data.ffmpegAvailable ? "Available" : "Not available"}`);
    } catch (err) {
      addResult("Master Engine Health", "❌ FAIL", err.message);
    }
    
    // Test 7: URL normalization
    try {
      const testUrls = [
        { input: "/api/beats/download/test.mp3", expected: `${STUDIO_API}/api/beats/download/test.mp3` },
        { input: "https://example.com/beat.mp3", expected: "https://example.com/beat.mp3" },
      ];
      
      let allPassed = true;
      for (const test of testUrls) {
        const result = normalizeAudioUrl(test.input);
        if (result !== test.expected) {
          allPassed = false;
          break;
        }
      }
      addResult("URL Normalization", allPassed ? "✅ PASS" : "❌ FAIL", `Tested ${testUrls.length} URL patterns`);
    } catch (err) {
      addResult("URL Normalization", "❌ FAIL", err.message);
    }
    
    // Test 8: BeatPlayer class
    try {
      const player = new BeatPlayer();
      addResult("BeatPlayer Class", "✅ PASS", "BeatPlayer instantiated successfully");
    } catch (err) {
      addResult("BeatPlayer Class", "❌ FAIL", err.message);
    }
    
    // Test 9: Recording capability
    try {
      const hasRecording = recorder.hasMic;
      addResult("Recording Capability", hasRecording ? "✅ PASS" : "⚠️ WARN", hasRecording ? "Recording ready" : "Mic not available (may need user gesture)");
    } catch (err) {
      addResult("Recording Capability", "❌ FAIL", err.message);
    }
    
    // Test 10: Static file serving
    try {
      const res = await fetch(`${STUDIO_API}/api/health`);
      const data = await res.json();
      addResult("Studio API Reachable", data.status === "ok" ? "✅ PASS" : "❌ FAIL", `Status: ${data.status}`);
    } catch (err) {
      addResult("Studio API Reachable", "❌ FAIL", err.message);
    }
    
    setRunning(false);
  };
  
  const generateTestBeat = async () => {
    addResult("Beat Generation", "⏳ RUNNING", "Generating test beat...");
    
    try {
      const res = await fetch(`${STUDIO_API}/api/studio/ai/quick-beat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bpm: 140, style: "trap", mood: "dark", bars: 8 }),
      });
      
      const data = await res.json();
      
      if (data.ok && data.audioUrl) {
        addResult("Beat Generation", "✅ PASS", `Generated: ${data.name}, URL: ${data.audioUrl}`);
        
        // Test playback of generated beat
        const audio = new Audio(normalizeAudioUrl(data.audioUrl));
        audio.volume = 0.3;
        await audio.play();
        await new Promise(r => setTimeout(r, 2000));
        audio.pause();
        addResult("Beat Playback", "✅ PASS", "Beat played successfully for 2 seconds");
      } else if (data.pattern) {
        addResult("Beat Generation", "⚠️ WARN", `Pattern generated (no audio - AI not configured): ${data.source}`);
      } else {
        addResult("Beat Generation", "❌ FAIL", data.message || "No audio URL returned");
      }
    } catch (err) {
      addResult("Beat Generation", "❌ FAIL", err.message);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 8 }}>🔊 PowerStream Audio System Test</h1>
      <p style={{ color: "#888", marginBottom: 24 }}>
        This page tests all audio subsystems. Click "Run All Tests" to begin.
      </p>
      
      {/* Control buttons */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button
          onClick={runAllTests}
          disabled={running}
          style={{
            padding: "12px 24px",
            background: running ? "#666" : "#22c55e",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: running ? "wait" : "pointer",
          }}
        >
          {running ? "Running..." : "🧪 Run All Tests"}
        </button>
        
        <button
          onClick={generateTestBeat}
          disabled={running}
          style={{
            padding: "12px 24px",
            background: "#ffb84d",
            color: "#000",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          🎵 Generate & Play Test Beat
        </button>
        
        <button
          onClick={() => setTestResults([])}
          style={{
            padding: "12px 24px",
            background: "rgba(255,255,255,0.1)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          🗑️ Clear Results
        </button>
      </div>
      
      {/* API endpoint info */}
      <div style={{ background: "rgba(255,255,255,0.05)", padding: 16, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8, fontSize: 14 }}>📡 API Configuration</h3>
        <div style={{ fontFamily: "monospace", fontSize: 13, color: "#888" }}>
          <div>Studio API: <span style={{ color: "#fff" }}>{STUDIO_API}</span></div>
        </div>
      </div>
      
      {/* Results table */}
      {testResults.length > 0 && (
        <div style={{ background: "#1a1a1f", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Test</th>
                <th style={{ padding: 12, textAlign: "center", fontWeight: 600, width: 100 }}>Status</th>
                <th style={{ padding: 12, textAlign: "left", fontWeight: 600 }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {testResults.map((result, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: 12 }}>{result.name}</td>
                  <td style={{ padding: 12, textAlign: "center" }}>{result.status}</td>
                  <td style={{ padding: 12, color: "#888", fontSize: 13 }}>{result.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Summary */}
      {testResults.length > 0 && !running && (
        <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
          <h3 style={{ marginBottom: 8 }}>📊 Summary</h3>
          <div style={{ display: "flex", gap: 24 }}>
            <div>
              <span style={{ color: "#22c55e", fontWeight: 700 }}>
                {testResults.filter(r => r.status.includes("PASS")).length}
              </span> Passed
            </div>
            <div>
              <span style={{ color: "#f59e0b", fontWeight: 700 }}>
                {testResults.filter(r => r.status.includes("WARN")).length}
              </span> Warnings
            </div>
            <div>
              <span style={{ color: "#ef4444", fontWeight: 700 }}>
                {testResults.filter(r => r.status.includes("FAIL")).length}
              </span> Failed
            </div>
          </div>
        </div>
      )}
      
      {/* Monitor status */}
      <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.05)", borderRadius: 8 }}>
        <h3 style={{ marginBottom: 12 }}>🎧 Live Monitor Status</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#888" }}>Monitoring</div>
            <div style={{ fontWeight: 600, color: monitor.isMonitoring ? "#22c55e" : "#888" }}>
              {monitor.isMonitoring ? "Active" : "Inactive"}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888" }}>Mic Level</div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 4, marginTop: 4 }}>
              <div style={{
                width: `${monitor.micLevel * 100}%`,
                height: "100%",
                background: monitor.micLevel > 0.8 ? "#ef4444" : "#22c55e",
                borderRadius: 4,
                transition: "width 50ms",
              }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#888" }}>Latency</div>
            <div style={{ fontWeight: 600 }}>{monitor.latency.toFixed(1)}ms</div>
          </div>
        </div>
        
        <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
          <button
            onClick={() => monitor.isMonitoring ? monitor.stopMonitoring() : monitor.startMonitoring()}
            style={{
              padding: "8px 16px",
              background: monitor.isMonitoring ? "#ef4444" : "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {monitor.isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
          </button>
          
          {monitor.isMonitoring && (
            <button
              onClick={monitor.toggleMute}
              style={{
                padding: "8px 16px",
                background: monitor.isMuted ? "#f59e0b" : "rgba(255,255,255,0.1)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              {monitor.isMuted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



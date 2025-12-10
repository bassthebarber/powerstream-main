import React, { useEffect, useState } from "react";

/**
 * One-file Design Console: presets + engine + UI
 * Commands:
 *   preset facebook | preset instagram | preset tiktok
 *   list presets
 *   show right-rail | hide right-rail
 *   show sidebar   | hide sidebar
 *   show stories   | hide stories
 *   density compact|cozy|comfortable
 */

/* ---- Presets ---- */
const PRESETS = {
  facebook: {
    name: "Facebook",
    vars: {
      "--panel": "#111418",
      "--feed-width": "680px",
      "--rail-width": "320px",
      "--sidebar-width": "260px",
      "--gap": "18px",
    },
    classes: [
      "layout-facebook",
      "layout-sidebar-left",
      "layout-feed-center",
      "layout-right-rail",
      "show-stories",
      "density-comfortable",
    ],
  },
  instagram: {
    name: "Instagram",
    vars: { "--feed-width": "1000px", "--gap": "16px" },
    classes: ["layout-instagram", "layout-grid-media", "layout-no-right-rail", "density-cozy"],
  },
  tiktok: {
    name: "TikTok",
    vars: { "--gap": "12px" },
    classes: ["layout-tiktok", "layout-vertical-reels", "layout-full-height", "density-comfortable"],
  },
};

/* ---- Engine helpers ---- */
function setVars(vars = {}) {
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
}

function resetBodyLayouts() {
  const b = document.body;
  b.className = b.className
    .split(" ")
    .filter(
      (c) =>
        c &&
        !c.startsWith("layout-") &&
        !c.startsWith("density-") &&
        c !== "show-stories"
    )
    .join(" ");
}

function addClasses(classes = []) {
  const b = document.body;
  classes.forEach((c) => b.classList.add(c));
}

function applyPreset(key) {
  const p = PRESETS[key];
  if (!p) throw new Error(`Unknown preset: ${key}`);
  setVars(p.vars);
  resetBodyLayouts();
  addClasses(p.classes);
  localStorage.setItem("ps.designPreset", key);
  return p.name;
}

/* ---- Command router ---- */
function runDesignCommand(input) {
  const cmd = (input || "").trim().toLowerCase();

  // preset <name>
  const mp = cmd.match(/^(preset|style|mode)\s+([a-z0-9_-]+)$/i);
  if (mp) {
    const name = applyPreset(mp[2]);
    return `✅ Applied preset: ${name}`;
  }

  if (cmd === "list presets") {
    return `Available: ${Object.keys(PRESETS).join(", ")}`;
  }

  // show/hide blocks
  const ms = cmd.match(/^(show|hide)\s+(right-rail|stories|sidebar)$/);
  if (ms) {
    const on = ms[1] === "show";
    const map = {
      "right-rail": "layout-right-rail",
      stories: "show-stories",
      sidebar: "layout-sidebar-left",
    };
    document.body.classList.toggle(map[ms[2]], on);
    return `✅ ${on ? "Showing" : "Hiding"} ${ms[2]}`;
  }

  // density
  const md = cmd.match(/^density\s+(compact|cozy|comfortable)$/);
  if (md) {
    ["density-compact", "density-cozy", "density-comfortable"].forEach((c) =>
      document.body.classList.remove(c)
    );
    document.body.classList.add(`density-${md[1]}`);
    return `✅ Density: ${md[1]}`;
  }

  return "Unknown command. Try: preset facebook | list presets | show right-rail | hide sidebar | density cozy";
}

/* ---- UI ---- */
export default function InlineDesignConsole() {
  const [cmd, setCmd] = useState("");
  const [log, setLog] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("ps.consoleLog") || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  // On first mount, restore last preset or default to facebook
  useEffect(() => {
    const saved = localStorage.getItem("ps.designPreset");
    try {
      saved ? applyPreset(saved) : applyPreset("facebook");
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ps.consoleLog", JSON.stringify(log.slice(0, 50)));
  }, [log]);

  const run = (e) => {
    e?.preventDefault();
    const text = cmd.trim();
    if (!text) return;
    const out = runDesignCommand(text);
    setLog((l) => [`> ${text}`, out, ...l].slice(0, 50));
    setCmd("");
  };

  const quick = (text) => () => {
    setCmd(text);
    const out = runDesignCommand(text);
    setLog((l) => [`> ${text}`, out, ...l].slice(0, 50));
  };

  return (
    <div className="card" style={{ margin: "16px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <strong style={{ color: "var(--gold)" }}>Design Console (Inline)</strong>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
        <button className="gold-btn" onClick={quick("preset facebook")}>Facebook</button>
        <button className="gold-btn" onClick={quick("preset instagram")}>Instagram</button>
        <button className="gold-btn" onClick={quick("preset tiktok")}>TikTok</button>
        <span style={{ opacity: 0.8, margin: "0 6px" }}>|</span>
        <button className="gold-btn" onClick={quick("show sidebar")}>Show Sidebar</button>
        <button className="gold-btn" onClick={quick("hide sidebar")}>Hide Sidebar</button>
        <button className="gold-btn" onClick={quick("show right-rail")}>Show Right Rail</button>
        <button className="gold-btn" onClick={quick("hide right-rail")}>Hide Right Rail</button>
        <button className="gold-btn" onClick={quick("show stories")}>Show Stories</button>
        <button className="gold-btn" onClick={quick("hide stories")}>Hide Stories</button>
        <span style={{ opacity: 0.8, margin: "0 6px" }}>|</span>
        <button className="gold-btn" onClick={quick("density compact")}>Compact</button>
        <button className="gold-btn" onClick={quick("density cozy")}>Cozy</button>
        <button className="gold-btn" onClick={quick("density comfortable")}>Comfortable</button>
      </div>

      {/* Command input */}
      <form onSubmit={run} style={{ marginTop: 10 }}>
        <input
          className="input"
          placeholder="Type a command (e.g., preset facebook)"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
        />
        <button className="button" style={{ marginTop: 8 }}>Run</button>
      </form>

      {/* Log */}
      <div style={{ marginTop: 10, maxHeight: 220, overflow: "auto", fontSize: 12, opacity: 0.95 }}>
        {log.map((line, i) => (
          <div key={i} style={{ marginBottom: 6 }}>{line}</div>
        ))}
      </div>
    </div>
  );
}



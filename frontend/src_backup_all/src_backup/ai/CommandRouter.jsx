// src/ai/CommandRouter.js
import { applyDesignPreset, listPresets } from "./DesignEngine";

// helper: add/remove body flags
function setFlag(flag, on) {
  document.body.classList.toggle(flag, on);
}

// helper: set density class
function setDensity(mode) {
  ["density-compact", "density-cozy", "density-comfortable"].forEach(c =>
    document.body.classList.remove(c)
  );
  document.body.classList.add(`density-${mode}`);
}

// helper: nuke splash/hero if present and mark as hidden
function hideSplash() {
  // try common ids/classes just in case
  const suspects = [
    "#splash-logo",
    ".splash",
    ".hero",
    ".welcome",
    ".brand-hero"
  ];
  suspects.forEach(sel => {
    document.querySelectorAll(sel).forEach(el => el.remove());
  });
  document.body.classList.add("no-splash");
}

export function runCommand(input) {
  const cmd = (input || "").trim().toLowerCase();

  // --- MACRO: setup facebook ---
  if (cmd === "setup facebook" || cmd === "preset facebook all") {
    applyDesignPreset("facebook");
    setFlag("layout-sidebar-left", true);
    setFlag("layout-right-rail", true);
    setFlag("show-stories", true);
    setDensity("comfortable");
    hideSplash();
    return "✅ Facebook baseline applied (sidebar + right rail + stories + density comfortable, splash hidden).";
  }

  // preset/style/mode <name>
  const mp = cmd.match(/^(preset|style|mode)\s+([a-z0-9_-]+)$/i);
  if (mp) {
    const name = applyDesignPreset(mp[2]);
    return `✅ Applied preset: ${name}`;
  }

  if (cmd === "list presets") return `Available: ${listPresets().join(", ")}`;

  // show/hide right-rail | stories | sidebar | splash
  const ms = cmd.match(/^(show|hide)\s+(right-rail|stories|sidebar|splash)$/);
  if (ms) {
    const on = ms[1] === "show";
    if (ms[2] === "splash") {
      if (on) { document.body.classList.remove("no-splash"); return "✅ Showing splash (if present)"; }
      hideSplash(); return "✅ Splash hidden";
    }
    const map = {
      "right-rail": "layout-right-rail",
      "stories": "show-stories",
      "sidebar": "layout-sidebar-left",
    };
    const flag = map[ms[2]];
    setFlag(flag, on);
    return `✅ ${on ? "Showing" : "Hiding"} ${ms[2]}`;
  }

  // density compact|cozy|comfortable
  const md = cmd.match(/^density\s+(compact|cozy|comfortable)$/);
  if (md) {
    setDensity(md[1]);
    return `✅ Density set: ${md[1]}`;
  }

  return "Unknown command. Try: setup facebook | preset facebook | show right-rail | hide sidebar | density cozy | list presets";
}



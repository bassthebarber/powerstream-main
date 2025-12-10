// src/ai/ConsoleGlobals.js
import { applyDesignPreset, restoreLastPreset } from "./DesignEngine";
import { runCommand } from "./CommandRouter";

export function installConsoleGlobals() {
  const g = globalThis || window;

  // core helpers
  g.preset = (key) => {
    const name = applyDesignPreset(key);
    console.info(`✅ Applied preset: ${name}`);
    return name;
  };
  g.run = (cmd) => {
    const out = runCommand(cmd);
    console.info(out);
    return out;
  };
  g.show = (what) => g.run(`show ${what}`);
  g.hide = (what) => g.run(`hide ${what}`);
  g.density = (mode) => g.run(`density ${mode}`);
  g.restorePreset = () => restoreLastPreset();

  // easy namespace to discover in DevTools
  g.ps = {
    preset: g.preset,
    run: g.run,
    show: g.show,
    hide: g.hide,
    density: g.density,
    restore: g.restorePreset,
    help() {
      console.log(
        [
          "ps.preset('facebook' | 'instagram' | 'tiktok')",
          "ps.show('sidebar' | 'right-rail' | 'stories' | 'hero')",
          "ps.hide('sidebar' | 'right-rail' | 'stories' | 'hero')",
          "ps.density('compact' | 'cozy' | 'comfortable')",
          "ps.run('preset facebook')  // raw command runner",
          "ps.restore()               // restore last preset",
        ].join("\n")
      );
    },
  };

  console.log(
    "%cPowerStream DevTools ready → try ps.help()",
    "color:#F7C948;font-weight:bold"
  );
}



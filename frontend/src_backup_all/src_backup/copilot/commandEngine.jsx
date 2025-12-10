// Maps simple text commands to design actions
export function runCommand(input, ctx) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "No command.";

  const [cmd, ...rest] = raw.split(/\s+/);
  const arg = rest.join(" ");

  switch (cmd) {
    case "layout": {
      const val = arg || "feed";
      if (!["feed","gram","reel"].includes(val)) return "layout requires: feed | gram | reel";
      ctx.setLayout(val);
      return `Layout set to ${val}.`;
    }
    case "gold": {
      const val = arg || "soft";
      if (!["soft","strong"].includes(val)) return "gold requires: soft | strong";
      ctx.setGoldMode(val);
      return `Gold mode: ${val}.`;
    }
    case "theme": {
      if (arg === "powerstream" || arg === "default") {
        // example: tweak CSS vars live if you want
        const root = document.documentElement;
        root.style.setProperty("--bg", "#0a0a0a");
        root.style.setProperty("--panel", "#121212");
        root.style.setProperty("--text", "#EDEDED");
        root.style.setProperty("--gold", "#F7C948");
        root.style.setProperty("--gold2", "#D4A62A");
        return "Theme set: PowerStream.";
      }
      return "theme requires: powerstream";
    }
    case "grid": {
      const n = parseInt(arg, 10);
      if (!n || n < 1 || n > 6) return "grid requires 1..6";
      document.documentElement.style.setProperty("--tiles-min", `${Math.max(180, 120*n)}px`);
      return `Grid hint set: ${n} (custom var --tiles-min updated)`;
    }
    default:
      return `Unknown command: ${cmd}`;
  }
}



// frontend/src/utils/aiCommandMap.js
const API_BASE =
  (import.meta.env && import.meta.env.VITE_API_BASE) ||
  "http://127.0.0.1:5001/api";

async function callCopilot(command, context = {}) {
  const res = await fetch(`${API_BASE}/copilot/command`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, context }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `Copilot failed (${res.status})`);
  alert(`✅ Copilot ok: ${command}`);
  return data;
}

function go(path) {
  // works with BrowserRouter
  window.history.pushState({}, "", path);
  // let React Router notice the change
  window.dispatchEvent(new Event("popstate"));
}

const commandMap = {
  // Navigation
  "go to feed": () => go("/feed"),
  "open feed": () => go("/feed"),
  "go to gram": () => go("/gram"),
  "open gram": () => go("/gram"),
  "go to reel": () => go("/reel"),
  "open reel": () => go("/reel"),
  "go to tv": () => go("/tv"),
  "open tv": () => go("/tv"),
  "open copilot": () => go("/copilot"),
  "open console": () => go("/copilot"),
  "open voice": () => go("/voice"),

  // Build actions
  "build powerfeed": () =>
    callCopilot("build powerfeed", { layout: "default", routes: { autofix: true } }),
  "build powergram": () =>
    callCopilot("build powergram", { layout: "default", routes: { autofix: true } }),
  "build powerreels": () =>
    callCopilot("build powerreels", { layout: "default", routes: { autofix: true } }),
  "build tv": () =>
    callCopilot("build tv", {
      network: "Southern Power Syndicate",
      routes: { autofix: true, splitPages: true },
    }),

  // Quick auth helpers (optional)
  "log in": async () => {
    const email = "owner@powerstream.local";
    const password = "Power!2345";
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error || "Login failed");
    localStorage.setItem("ps_token", data.token);
    alert("✅ Logged in");
  },

  "log out": () => {
    localStorage.removeItem("ps_token");
    alert("👋 Logged out");
  },
};

export default commandMap;



#!/usr/bin/env node
import fs from "fs";
import path from "path";
import fg from "fast-glob";

const ROOT = process.cwd();
const TARGETS = [
  { dir: "backend", exts: ["js", "mjs", "jsx"] },
  { dir: "frontend/src", exts: ["js", "mjs", "jsx"] },
];

const WRITE = process.argv.includes("--write");

function levenshtein(a, b) {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  const matrix = Array.from({ length: bn + 1 }, (_, i) => [i]);
  for (let j = 0; j <= an; j++) matrix[0][j] = j;
  for (let i = 1; i <= bn; i++) {
    for (let j = 1; j <= an; j++) {
      const cost = a[j - 1] === b[i - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  return matrix[bn][an];
}

function nearest(target, candidates) {
  let best = null;
  let bestScore = Infinity;
  for (const c of candidates) {
    const s = levenshtein(target, path.basename(c));
    if (s < bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return { best, score: bestScore };
}

function resolveLike(fileDir, spec) {
  // Try as-is for files/dirs with index.js
  const base = path.resolve(fileDir, spec);
  const attempts = [
    base,
    `${base}.js`,
    `${base}.mjs`,
    `${base}.jsx`,
    path.join(base, "index.js"),
    path.join(base, "index.mjs"),
    path.join(base, "index.jsx"),
  ];
  for (const a of attempts) {
    if (fs.existsSync(a)) return a;
  }
  return null;
}

const importRE =
  /\bimport\s+(?:.+?\sfrom\s+)?["']([^"']+)["']|require\(\s*["']([^"']+)["']\s*\)/g;

let hadErrors = false;

for (const { dir, exts } of TARGETS) {
  const root = path.join(ROOT, dir);
  const files = fg.sync(`**/*.{${exts.join(",")}}`, { cwd: root, dot: false });

  // Catalog all files (for suggestions)
  const catalog = fg.sync("**/*.{js,mjs,jsx}", { cwd: root, dot: false });

  for (const rel of files) {
    const abs = path.join(root, rel);
    const code = fs.readFileSync(abs, "utf8");
    let m;
    let changed = false;
    importRE.lastIndex = 0;

    const edits = [];
    while ((m = importRE.exec(code))) {
      const spec = m[1] || m[2];
      if (!spec) continue;
      // only check relative specs; aliases like "@/.." are skipped here
      if (!spec.startsWith("."))
        continue;

      const fileDir = path.dirname(abs);
      const resolved = resolveLike(fileDir, spec);
      if (resolved) continue;

      hadErrors = true;
      const baseName = path.basename(spec).replace(/\.(js|mjs|jsx)$/, "");
      const candidates = catalog.filter((f) =>
        path.basename(f).startsWith(baseName)
      );
      const { best } = nearest(baseName, candidates);

      console.log(
        `❌ ${path.join(dir, rel)} → "${spec}" not found${
          best ? `; did you mean "./${path.relative(fileDir, path.join(root, best)).replace(/\\/g,"/")}"?` : "."
        }`
      );

      if (WRITE && best) {
        const newSpec =
          "./" +
          path
            .relative(fileDir, path.join(root, best))
            .replace(/\\/g, "/")
            .replace(/\.(js|mjs|jsx)$/, "");
        edits.push({ from: spec, to: newSpec });
      }
    }

    if (WRITE && edits.length) {
      let out = code;
      for (const e of edits) {
        const rx = new RegExp(`(["'])${e.from.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\1`, "g");
        out = out.replace(rx, `"${e.to}"`);
      }
      fs.writeFileSync(abs, out, "utf8");
      changed = true;
      console.log(`✏️  Rewrote imports in ${path.join(dir, rel)}`);
    }

    if (changed) {
      // no-op
    }
  }
}

if (hadErrors) {
  console.log(
    `\n🔎 Done scanning. Some imports were missing. Re-run with "--write" to auto-rewrite relative paths when a close match is found.`
  );
} else {
  console.log("✅ No missing relative imports detected.");
}

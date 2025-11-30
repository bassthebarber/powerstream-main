import fs from 'node:fs';
import path from 'node:path';
const ROOT = process.cwd(), SRC = path.join(ROOT, 'src');

const files = [];
(function walk(dir){ for (const f of fs.readdirSync(dir)) {
  const p = path.join(dir, f), s = fs.statSync(p);
  if (s.isDirectory()) walk(p); else if (/\.(jsx?|tsx?)$/.test(f)) files.push(p);
}})(SRC);

for (const f of files) {
  const old = fs.readFileSync(f, 'utf8');
  let code = old
    .replace(/frontend\/(?:frontend\/)+/g, 'frontend/')
    .replace(/StoryBar\.css/g, 'StoryBar.module.css')
    .replace(/Composer\.css/g, 'Composer.module.css')
    .replace(/from\s+["'](\.\.\/)+/g, "from '@/");
  if (code !== old) fs.writeFileSync(f, code, 'utf8');
}
console.log('fix-paths done.');

import { execSync } from 'node:child_process';
const run = (c) => execSync(c, { stdio: 'inherit', shell: true });
try {
  run('npm run fix:paths');
  run('npm run fix:imports');
  run('npm run format');
  run('npm run build');
  console.log('✅ PowerFix complete');
} catch (e) { console.error('❌ PowerFix failed'); process.exit(1); }

import { execFileSync, spawn, spawnSync } from 'node:child_process';

const status = execFileSync('npx', ['supabase', 'status', '-o', 'env'], { encoding: 'utf8' });
const values = Object.fromEntries(status.split('\n').filter(line => line.includes('=')).map(line => {
  const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
}));
const env = { ...process.env, APP_ENV: 'local', NEXT_PUBLIC_SUPABASE_URL: values.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: values.ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: values.SERVICE_ROLE_KEY,
  SUPABASE_URL: values.API_URL, SUPABASE_ANON_KEY: values.ANON_KEY,
  OPENAI_IMPORT_ENABLED: 'false', OPENAI_VOICE_ENABLED: 'false', DO_NOT_TRACK: '1' };
if (!env.T04R1_PLAYWRIGHT_MODULE) throw new Error('Ustaw T04R1_PLAYWRIGHT_MODULE na moduł Playwright z runtime desktopowego.');
const built = spawnSync('npm', ['run', 'build'], { stdio: 'inherit', env });
if (built.status !== 0) process.exit(built.status ?? 1);
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3008'], { stdio: 'inherit', env });
try {
  let ready = false;
  for (let index = 0; index < 100; index++) {
    try { if ((await fetch('http://localhost:3008/')).status) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error('Serwer T04-R1 nie wystartował.');
  const result = spawnSync(process.execPath, ['scripts/test-t04r1-browser.mjs'], { stdio: 'inherit', env });
  process.exitCode = result.status ?? 1;
} finally { server.kill('SIGTERM'); }

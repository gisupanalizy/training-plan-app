import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

// Wyłącznie lokalne, syntetyczne konta. Bez resetu bazy, realnych fixtures i płatnego AI.
const status = execFileSync('npx', ['supabase', 'status', '-o', 'env'], { encoding: 'utf8' });
const values = Object.fromEntries(status.split('\n').filter(line => line.includes('=')).map(line => {
  const index = line.indexOf('='); return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
}));
const env = { ...process.env, APP_ENV: 'local', SUPABASE_URL: values.API_URL, SUPABASE_ANON_KEY: values.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: values.SERVICE_ROLE_KEY, SUPABASE_JWT_SECRET: values.JWT_SECRET,
  NEXT_PUBLIC_SUPABASE_URL: values.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: values.ANON_KEY,
  OPENAI_IMPORT_ENABLED: 'false', OPENAI_VOICE_ENABLED: 'false', OPENAI_API_KEY: '',
  RUN_T06_LIVE: 'false', RUN_T09_LIVE: 'false', T06_REAL_STAGE: '',
  DO_NOT_TRACK: '1', CRON_SECRET: randomUUID(),
  T08_HTTP_BASE: 'http://localhost:3006', T09_HTTP_BASE: 'http://localhost:3006',
  T04R1_HTTP_BASE: 'http://localhost:3006', T10_HTTP_BASE: 'http://localhost:3006',
  T04R1_PLAYWRIGHT_MODULE: process.env.T10_PLAYWRIGHT_MODULE };
if (!env.T10_PLAYWRIGHT_MODULE) throw new Error('Ustaw T10_PLAYWRIGHT_MODULE na moduł Playwright z runtime desktopowego.');
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Brak lokalnego Supabase.');
function run(program, args, extraEnv = {}) {
  const result = spawnSync(program, args, { env: { ...env, ...extraEnv }, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${program} ${args.join(' ')}: kod ${result.status ?? result.error?.code}`);
}
const browserOnly = process.argv.includes('--browser-only');
try {
  if (!browserOnly) {
    // T03 zawiera Mailpit i wygasły JWT; nie uruchamia płatnego API.
    run(process.execPath, ['scripts/run-local-t03.mjs']);
    for (const script of ['test-t04-api.mjs', 'test-t05-api.mjs', 'test-t06r1-api.mjs', 'test-t10-api.mjs']) {
      run(process.execPath, [`scripts/${script}`]);
    }
    run(process.execPath, ['scripts/run-local-t06.mjs']);
    run('npm', ['test']);
    run('npm', ['run', 'build']);
    run('npm', ['run', 'typecheck']);
  }
  const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '-p', '3006'], { env, stdio: 'inherit' });
  try {
    let ready = false;
    for (let index = 0; index < 100; index++) {
      try { if ((await fetch(`${env.T10_HTTP_BASE}/logowanie`)).ok) { ready = true; break; } } catch {}
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    if (!ready) throw new Error('Serwer T10 nie wystartował.');
    for (const script of browserOnly ? ['test-t10-browser.mjs'] : ['test-t06-http.mjs', 'test-t08-api.mjs', 'test-t09-api.mjs', 'test-t04r1-browser.mjs', 'test-t10-browser.mjs']) {
      run(process.execPath, [`scripts/${script}`]);
    }
  } finally {
    server.kill('SIGTERM');
    await new Promise(resolve => { if (server.exitCode !== null) resolve(); else server.once('exit', resolve); });
  }
  console.log(browserOnly ? 'T10 Chrome trening: PASS (bez ponowienia pozostałych testów/builda).' : 'T10 lokalny odbiór: PASS. Telefon, Safari i hosting wymagają osobnego odbioru.');
} catch (error) {
  console.error(error.message); process.exitCode = 1;
}

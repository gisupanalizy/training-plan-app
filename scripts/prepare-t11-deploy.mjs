import { createHash } from "node:crypto";
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Bez sieci, bez odczytu .env, bez zmiany powiązania usług i bez uploadu.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const roots = [".vercelignore", "package.json", "package-lock.json", "next.config.ts", "next-env.d.ts", "tsconfig.json", "vercel.json", "scripts/copy-pdf-worker.mjs", "src", "public"];
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const denied = (path) => /(^|\/)\.env[^/]*(\/|$)|\.(pem|key)$/.test(path);
const excluded = (path) => /\.test\.[^/]+$|(^|\/)__tests__(\/|$)/.test(path) || path === "public/pdf.worker.min.mjs";
function collect(base, paths) {
  const files = [];
  function walk(path) {
    const full = join(base, path);
    const stat = lstatSync(full);
    if (stat.isSymbolicLink()) throw new Error(`Dowiązanie zabronione: ${path}`);
    if (denied(path)) throw new Error(`Plik zabroniony: ${path}`);
    if (excluded(path)) return;
    if (stat.isDirectory()) {
      for (const child of readdirSync(full).sort()) walk(`${path}/${child}`);
    } else {
      if (!stat.isFile()) throw new Error(`Nieobsługiwany typ pliku: ${path}`);
      const bytes = readFileSync(full);
      // Detekcja znanych formatów sekretów; nie zastępuje przeglądu źródeł.
      if (/sk-(?:proj-|svcacct-)?[a-zA-Z0-9_-]{24,}|sb_secret_[a-zA-Z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(bytes.toString()))
        throw new Error(`Podejrzenie sekretu: ${path}`);
      files.push({ path, bytes: stat.size, sha256: hash(bytes) });
    }
  }
  for (const path of paths) walk(path);
  return files.sort((a, b) => a.path.localeCompare(b.path, "en"));
}
const args = process.argv.slice(2);
if (args.length > 1 || (args.length === 1 && args[0] !== "--stage")) throw new Error("Użycie: node scripts/prepare-t11-deploy.mjs [--stage]");
const files = collect(root, roots);
const migrations = collect(root, ["supabase/migrations"]);
if (migrations.length !== 20 || !migrations.some((file) => file.path.endsWith("20261014100000_t10_plan_write_boundary.sql")))
  throw new Error("Sprawdź zmianę zestawu 20 migracji T02–T10 przed wydaniem.");
let stage = null;
if (args[0] === "--stage") {
  stage = mkdtempSync(join(tmpdir(), "apka-t11-release-"));
  for (const file of files) {
    mkdirSync(dirname(join(stage, file.path)), { recursive: true });
    cpSync(join(root, file.path), join(stage, file.path));
  }
  const copied = collect(stage, readdirSync(stage));
  if (JSON.stringify(files) !== JSON.stringify(copied)) throw new Error("Niezgodna kopia źródeł.");
}
const manifest = { schema: 1, kind: "local-release-candidate", uploaded: false, stage,
  fileCount: files.length, totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  filesSha256: hash(JSON.stringify(files)), files, migrations };
const output = join(root, "docs/reports/2026-10-14-T11-release.json");
writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ manifest: relative(root, output), fileCount: manifest.fileCount, filesSha256: manifest.filesSha256, stage, uploaded: false }));

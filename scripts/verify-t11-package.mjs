import assert from "node:assert/strict";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temp = mkdtempSync(join(tmpdir(), "t11-package-check-"));
function run(command, args, cwd = temp) {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}
try {
  const common = { "fixtures/t06/real/source.pdf": true, "fixtures/t06/real/results/data.json": true,
    ".env": true, ".env.local": true, ".vercel/project.json": true,
    "src/app/page.tsx": false, "package.json": false, "scripts/copy-pdf-worker.mjs": false };
  for (const ignore of [".gitignore", ".vercelignore"]) {
    const cwd = join(temp, ignore.slice(1));
    mkdirSync(cwd);
    assert.equal(run("git", ["init", "-q"], cwd).status, 0);
    cpSync(join(root, ignore), join(cwd, ".gitignore"));
    const extra = ignore === ".gitignore" ? { ".env.example": false } : {
      "docs/STATUS.md": true, "scripts/evaluate-t06-real.mjs": true, "src/.env.local": true,
      "src/lib/imports/domain.test.ts": true, "supabase/.temp/project-ref": true };
    for (const [path, expected] of Object.entries({ ...common, ...extra })) {
      const result = run("git", ["check-ignore", "--no-index", "-q", path], cwd);
      assert.ok([0, 1].includes(result.status));
      assert.equal(result.status === 0, expected, `${ignore}: ${path}`);
    }
  }
  console.log("PASS: syntetyczne ścieżki Git/Vercel (semantyka Git, bez uploadu).");
  const manifest = JSON.parse(readFileSync(join(root, "docs/reports/2026-10-16-T11-E1-release.json"), "utf8"));
  const candidate = join(temp, "candidate");
  for (const file of [...manifest.files, ...manifest.migrations]) {
    const dest = join(candidate, file.path);
    mkdirSync(dirname(dest), { recursive: true });
    cpSync(join(root, file.path), dest);
  }
  mkdirSync(join(candidate, "public"), { recursive: true });
  mkdirSync(join(candidate, "docs/reports"), { recursive: true });
  cpSync(join(root, "scripts/prepare-t11-deploy.mjs"), join(candidate, "scripts/prepare-t11-deploy.mjs"));
  const prepare = () => run(process.execPath, ["scripts/prepare-t11-deploy.mjs"], candidate);
  assert.equal(prepare().status, 0);
  const regenerated = JSON.parse(readFileSync(join(candidate, "docs/reports/2026-10-16-T11-E1-release.json"), "utf8"));
  assert.deepEqual(regenerated.files, manifest.files, "Zmienione źródła wymagają nowego manifestu.");
  assert.deepEqual(regenerated.migrations, manifest.migrations);
  const probe = join(candidate, "src/t11-upload-probe");
  mkdirSync(probe);
  for (const [name, body] of [[".env.local", "SYNTHETIC=true"], ["secret.ts", `export const secret = "sk-proj-${"x".repeat(30)}";`]]) {
    writeFileSync(join(probe, name), body);
    const result = prepare();
    assert.notEqual(result.status, 0, name);
    assert.ok(!`${result.stdout}${result.stderr}`.includes(body));
    unlinkSync(join(probe, name));
  }
  symlinkSync(join(candidate, "package.json"), join(probe, "link.ts"));
  assert.notEqual(prepare().status, 0);
  unlinkSync(join(probe, "link.ts"));
  rmSync(probe, { recursive: true });
  assert.equal(prepare().status, 0);
  console.log("PASS: zgodne hashe; odrzucenie env, syntetycznego sekretu i dowiązania bez ujawnienia treści.");
} finally { rmSync(temp, { recursive: true, force: true }); }

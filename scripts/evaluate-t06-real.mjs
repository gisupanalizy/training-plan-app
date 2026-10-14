import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
const stage = process.argv[2];
if (!/^(before|after(?:-\d+)?)$/.test(stage ?? "")) throw new Error("Podaj before albo after[-numer].");
const configured = Object.fromEntries(readFileSync(".env", "utf8").split("\n").filter((line) => line.includes("=") && !line.startsWith("#")).map((line) => {
  const at = line.indexOf("="); return [line.slice(0, at).trim(), line.slice(at + 1).trim().replace(/^['"]|['"]$/g, "")];
}));
const status = JSON.parse(execFileSync("npx", ["supabase", "status", "-o", "json"], { encoding: "utf8" }));
const only = process.argv[3];
if (only && !["pdf", "fbw", "madzia"].includes(only)) throw new Error("Nieznane źródło.");
const env = { ...configured, ...process.env, SUPABASE_URL: status.API_URL, SUPABASE_ANON_KEY: status.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY, T06_REAL_STAGE: stage, ...(only ? { T06_REAL_ONLY: only } : {}) };
const result = spawnSync("npx", ["vitest", "run", "src/lib/imports/real-evaluation.test.ts"], { env, stdio: "inherit" });
process.exit(result.status ?? 1);

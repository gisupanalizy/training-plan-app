import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";
const status = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
const values = Object.fromEntries(status.split("\n").filter((line) => line.includes("=")).map((line) => {
  const index = line.indexOf("=");
  return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
}));
const env = { ...process.env, SUPABASE_URL: values.API_URL, SUPABASE_ANON_KEY: values.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: values.SERVICE_ROLE_KEY, T06_FIXTURE_DIR: resolve("fixtures/t06/generated") };
const result = spawnSync("npx", ["vitest", "run", "src/lib/imports/imports.integration.test.ts"], { env, stdio: "inherit" });
process.exit(result.status ?? 1);

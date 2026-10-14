import { execFileSync, spawnSync } from "node:child_process";

const status = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
const values = Object.fromEntries(status.split("\n").filter((line) => line.includes("=")).map((line) => {
  const index = line.indexOf("=");
  return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
}));
const env = { ...process.env, SUPABASE_URL: values.API_URL, SUPABASE_ANON_KEY: values.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: values.SERVICE_ROLE_KEY };
if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error("Lokalny Supabase nie zwrócił kluczy testowych.");
const result = spawnSync(process.execPath, ["scripts/test-t04-api.mjs"], { env, stdio: "inherit" });
process.exit(result.status ?? 1);

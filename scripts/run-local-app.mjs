import { execFileSync, spawn } from "node:child_process";

const status = execFileSync("npx", ["supabase", "status", "-o", "env"], { encoding: "utf8" });
const values = Object.fromEntries(status.split("\n").filter((line) => line.includes("=")).map((line) => {
  const index = line.indexOf("=");
  return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
}));
const action = process.argv[2] ?? "dev";
if (!["dev", "build", "start"].includes(action)) throw new Error("Nieznana akcja.");
const child = spawn("npm", ["run", action, ...(action === "build" ? [] : ["--", "-p", "3005"])], { stdio: "inherit", env: {
  ...process.env, APP_ENV: "local", NEXT_PUBLIC_SUPABASE_URL: values.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: values.ANON_KEY,
} });
child.on("exit", (code) => process.exit(code ?? 1));

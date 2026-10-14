import { readFileSync, unlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const path = join(tmpdir(), "t05-ui-fixture.json");
const fixture = JSON.parse(readFileSync(path, "utf8"));
const client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false } });
const { error } = await client.auth.admin.deleteUser(fixture.id);
if (error) throw error;
unlinkSync(path);
console.log("Usunięto syntetyczne konto T05 i tymczasowy plik po teście.");

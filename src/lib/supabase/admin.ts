import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig, usesStorageSupabase } from "./config";

// Importować wyłącznie w kodzie serwerowym; żaden sekret nie ma prefiksu NEXT_PUBLIC_.
export function createAdminClient() {
  const config = getSupabaseConfig();
  const key = usesStorageSupabase()
    ? process.env.STORAGE_SUPABASE_SECRET_KEY?.trim() || process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY?.trim()
    : process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!config || !key) throw new Error("Brak konfiguracji serwera importu.");
  if (key.startsWith("sb_publishable_")) throw new Error("Serwer importu wymaga klucza administracyjnego.");
  return createClient(config.url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

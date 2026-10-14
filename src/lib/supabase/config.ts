type SupabaseConfig = { url: string; key: string };

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url && !key && !process.env.VERCEL_ENV) return null;
  if (!url || !key) throw new Error("Brak pełnej konfiguracji Supabase.");
  if (key.startsWith("sb_secret_")) throw new Error("Klucz administracyjny nie może trafić do przeglądarki.");
  if (key.split(".").length === 3) {
    let role: unknown;
    try {
      role = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role;
    } catch { /* Nieparsowalny klucz odrzuci Supabase; nie używamy treści do autoryzacji. */ }
    if (role === "service_role") throw new Error("Klucz administracyjny nie może trafić do przeglądarki.");
  }

  const environment = process.env.APP_ENV;
  if (!environment || !["local", "preview", "production"].includes(environment)) {
    throw new Error("APP_ENV musi wskazywać local, preview albo production.");
  }
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== environment) {
    throw new Error("APP_ENV nie odpowiada środowisku Vercel.");
  }
  const parsed = new URL(url);
  if (environment === "local") {
    if (!["localhost", "127.0.0.1"].includes(parsed.hostname)) {
      throw new Error("Środowisko local wymaga lokalnego Supabase.");
    }
  } else {
    const projectRef = process.env.SUPABASE_EXPECTED_PROJECT_REF;
    const productionRef = process.env.SUPABASE_PRODUCTION_PROJECT_REF;
    if (!projectRef || !productionRef || parsed.hostname !== `${projectRef}.supabase.co`) {
      throw new Error("Adres Supabase nie odpowiada oczekiwanemu projektowi.");
    }
    if ((environment === "production") !== (projectRef === productionRef)) {
      throw new Error("Projekt Supabase nie odpowiada środowisku.");
    }
    if (parsed.protocol !== "https:") throw new Error("Zdalny Supabase wymaga HTTPS.");
  }
  return { url, key };
}

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./config";

const previous = { ...process.env };
beforeEach(() => {
  for (const name of Object.keys(process.env)) {
    if (name.startsWith("NEXT_PUBLIC_SUPABASE_") || name.startsWith("NEXT_PUBLIC_STORAGE_SUPABASE_")) delete process.env[name];
  }
});
afterEach(() => { process.env = { ...previous }; });

function configure(environment: string, url: string) {
  process.env.APP_ENV = environment;
  process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-key";
  process.env.SUPABASE_EXPECTED_PROJECT_REF = "previewref";
  process.env.SUPABASE_PRODUCTION_PROJECT_REF = "productionref";
  delete process.env.VERCEL_ENV;
}

describe("izolacja środowisk Supabase", () => {
  it("pozwala na lokalny tryb demonstracyjny bez konfiguracji", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.VERCEL_ENV;
    expect(getSupabaseConfig()).toBeNull();
  });
  it("odrzuca produkcyjną bazę w preview", () => {
    configure("preview", "https://productionref.supabase.co");
    process.env.SUPABASE_EXPECTED_PROJECT_REF = "productionref";
    expect(() => getSupabaseConfig()).toThrow();
  });
  it("odrzuca zdalny projekt w local oraz niezgodny Vercel env", () => {
    configure("local", "https://previewref.supabase.co");
    expect(() => getSupabaseConfig()).toThrow();
    configure("preview", "https://previewref.supabase.co");
    process.env.VERCEL_ENV = "production";
    expect(() => getSupabaseConfig()).toThrow();
  });
  it("akceptuje osobny projekt preview", () => {
    configure("preview", "https://previewref.supabase.co");
    expect(getSupabaseConfig()?.url).toBe("https://previewref.supabase.co");
  });
  it("odrzuca klucz administracyjny jako publiczny", () => {
    configure("local", "http://127.0.0.1:54321");
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_przyklad";
    expect(() => getSupabaseConfig()).toThrow();
  });
  it("używa pary integracji zamiast ręcznych wartości, także gdy duplikaty są błędne", () => {
    configure("production", "https://api.example.com");
    process.env.SUPABASE_EXPECTED_PROJECT_REF = "productionref";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_stary_duplikat";
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL = "https://productionref.supabase.co";
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fixture";
    expect(getSupabaseConfig()).toEqual({ url: "https://productionref.supabase.co", key: "sb_publishable_fixture" });
  });
  it.each(["url", "key"])("odrzuca niepełną integrację (%s), zamiast mieszać z ręcznym projektem", (part) => {
    configure("preview", "https://previewref.supabase.co");
    if (part === "url") process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL = "https://productionref.supabase.co";
    else process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY = "public-key";
    expect(() => getSupabaseConfig()).toThrow("Brak pełnej konfiguracji");
  });
  it("obsługuje starszy anon integracji i pomija pusty publishable", () => {
    configure("preview", "https://previewref.supabase.co");
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL = "https://previewref.supabase.co";
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY = "  ";
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY = "anon-fixture";
    expect(getSupabaseConfig()?.key).toBe("anon-fixture");
  });
  it.each(["sb_secret_przyklad", `header.${btoa(JSON.stringify({ role: "service_role" }))}.signature`])("nie przyjmuje sekretu w publicznym kluczu integracji", (key) => {
    configure("preview", "https://previewref.supabase.co");
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL = "https://previewref.supabase.co";
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY = key;
    expect(() => getSupabaseConfig()).toThrow("Klucz administracyjny");
  });
  it.each(["http://previewref.supabase.co", "https://productionref.supabase.co"])("zachowuje kontrolę HTTPS i izolację środowisk dla integracji", (url) => {
    configure("preview", "https://previewref.supabase.co");
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL = url;
    process.env.NEXT_PUBLIC_STORAGE_SUPABASE_ANON_KEY = "anon-fixture";
    expect(() => getSupabaseConfig()).toThrow();
  });
  it("blokuje niekompletny hosting bez przejścia w demo", () => {
    process.env.VERCEL_ENV = "production";
    expect(() => getSupabaseConfig()).toThrow("Brak pełnej konfiguracji");
  });
});

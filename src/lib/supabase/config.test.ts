import { afterEach, describe, expect, it } from "vitest";
import { getSupabaseConfig } from "./config";

const previous = { ...process.env };
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
});

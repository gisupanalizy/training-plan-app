// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@supabase/supabase-js";
import { createAdminClient } from "./admin";

vi.mock("@supabase/supabase-js", () => ({ createClient: vi.fn(() => ({ syntheticClient: true })) }));
const previous = { ...process.env };
beforeEach(() => {
  vi.clearAllMocks();
  for (const name of Object.keys(process.env)) {
    if (name.includes("SUPABASE") || name === "VERCEL_ENV") delete process.env[name];
  }
  process.env.APP_ENV = "production";
  process.env.VERCEL_ENV = "production";
  process.env.SUPABASE_EXPECTED_PROJECT_REF = "productionref";
  process.env.SUPABASE_PRODUCTION_PROJECT_REF = "productionref";
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL = "https://productionref.supabase.co";
  process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY = "public-fixture";
});
afterEach(() => { process.env = { ...previous }; });

describe("serwerowy klucz tego samego źródła Supabase", () => {
  it("korzysta z nowego sekretu integracji przed jej legacy service_role", () => {
    process.env.STORAGE_SUPABASE_SECRET_KEY = "storage-secret-fixture";
    process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY = "legacy-fixture";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "stale-manual-fixture";
    createAdminClient();
    expect(createClient).toHaveBeenCalledWith("https://productionref.supabase.co", "storage-secret-fixture",
      { auth: { autoRefreshToken: false, persistSession: false } });
  });
  it("obsługuje wyłącznie legacy service_role integracji", () => {
    process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY = "legacy-fixture";
    createAdminClient();
    expect(createClient).toHaveBeenCalledWith(expect.any(String), "legacy-fixture", expect.any(Object));
  });
  it("nie uzupełnia brakującego sekretu integracji ręcznym kluczem innego projektu", () => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "manual-other-project";
    expect(() => createAdminClient()).toThrow("Brak konfiguracji serwera");
    expect(createClient).not.toHaveBeenCalled();
  });
  it("nie tworzy klienta dla produkcyjnego refa w preview", () => {
    process.env.STORAGE_SUPABASE_SECRET_KEY = "secret-fixture";
    process.env.APP_ENV = "preview";
    process.env.VERCEL_ENV = "preview";
    expect(() => createAdminClient()).toThrow();
    expect(createClient).not.toHaveBeenCalled();
  });
  it("odrzuca publiczny publishable jako klucz administracyjny", () => {
    process.env.STORAGE_SUPABASE_SECRET_KEY = "sb_publishable_fixture";
    expect(() => createAdminClient()).toThrow("klucza administracyjnego");
    expect(createClient).not.toHaveBeenCalled();
  });
  it("zachowuje lokalne nazwy i lokalny service_role", () => {
    delete process.env.NEXT_PUBLIC_STORAGE_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_STORAGE_SUPABASE_PUBLISHABLE_KEY;
    delete process.env.VERCEL_ENV;
    process.env.APP_ENV = "local";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "local-public-fixture";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "local-service-fixture";
    createAdminClient();
    expect(createClient).toHaveBeenCalledWith("http://127.0.0.1:54321", "local-service-fixture", expect.any(Object));
  });
});

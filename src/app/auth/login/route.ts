import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { getSupabaseConfig } from "@/lib/supabase/config";

function redirectTo(request: NextRequest, path: string) {
  return NextResponse.redirect(new URL(path, request.url), 303);
}

function clientFor(request: NextRequest, response: NextResponse) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase nie jest skonfigurowany.");
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items) {
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return redirectTo(request, "/logowanie?blad=dane");

  const success = redirectTo(request, "/");
  const supabase = clientFor(request, success);
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return redirectTo(request, "/logowanie?blad=logowanie");
  try { await ensureProfile(supabase); }
  catch {
    const failure = redirectTo(request, "/logowanie?blad=profil");
    await clientFor(request, failure).auth.signOut({ scope: "local" });
    return failure;
  }
  return success;
}

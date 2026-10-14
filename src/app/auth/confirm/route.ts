import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const supabase = await createClient();
  const code = params.get("code");
  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type === "invite"
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "invite" })
      : { error: new Error("Nieprawidłowe zaproszenie.") };
  if (result.error) return NextResponse.redirect(new URL("/logowanie?blad=zaproszenie", request.url));
  try { await ensureProfile(supabase); }
  catch {
    await supabase.auth.signOut({ scope: "local" });
    return NextResponse.redirect(new URL("/logowanie?blad=profil", request.url));
  }
  return NextResponse.redirect(new URL("/ustaw-haslo", request.url));
}

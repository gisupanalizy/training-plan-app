import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig } from "./config";

export async function updateSession(request: NextRequest) {
  const config = getSupabaseConfig();
  if (!config) return NextResponse.next({ request });
  let response = NextResponse.next({ request });
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(items, headers) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        if (headers) Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  const { data, error } = await supabase.auth.getClaims();
  const path = request.nextUrl.pathname;
  const isPublic = path === "/logowanie" || path.startsWith("/auth/") || path === "/api/imports/cleanup";
  const authenticated = !error && Boolean(data?.claims) && data?.claims.is_anonymous !== true;
  if (!isPublic && !authenticated) {
    if (path.startsWith("/api/")) {
      const unauthorized = NextResponse.json({ error: "Sesja wygasła. Zaloguj się ponownie." }, { status: 401 });
      unauthorized.headers.set("Cache-Control", "no-store");
      response.cookies.getAll().forEach((cookie) => unauthorized.cookies.set(cookie));
      return unauthorized;
    }
    const redirect = NextResponse.redirect(new URL("/logowanie?powod=sesja", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  if (path === "/logowanie" && authenticated) {
    const redirect = NextResponse.redirect(new URL("/", request.url));
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  }
  return response;
}

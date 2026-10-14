// @vitest-environment node
import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { updateSession } from "./proxy";

const available = Boolean(process.env.SUPABASE_JWT_SECRET && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

describe.skipIf(!available)("rzeczywista sesja Supabase", () => {
  it("anonimowego użytkownika kieruje do logowania", async () => {
    const response = await updateSession(new NextRequest("http://127.0.0.1:3103/plany"));
    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/logowanie");
  });

  it("API bez sesji zwraca JSON 401 zamiast strony logowania", async () => {
    const response = await updateSession(new NextRequest("http://127.0.0.1:3103/api/workouts", { method: "POST" }));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toHaveProperty("error");
    expect(response.headers.get("location")).toBeNull();
  });

  it("wygasły JWT z nieważnym tokenem odświeżania kieruje do logowania", async () => {
    const expiresAt = Math.floor(Date.now() / 1000) - 3600;
    const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
    const body = Buffer.from(JSON.stringify({
      sub: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", role: "authenticated", aud: "authenticated",
      exp: expiresAt, iat: expiresAt - 3600, iss: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1`,
    })).toString("base64url");
    const content = `${header}.${body}`;
    const signature = createHmac("sha256", process.env.SUPABASE_JWT_SECRET!).update(content).digest("base64url");
    const session = {
      access_token: `${content}.${signature}`, refresh_token: "invalid-refresh-token", token_type: "bearer",
      expires_at: expiresAt, expires_in: 3600, user: { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" },
    };
    const cookie = `sb-127-auth-token=base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
    const response = await updateSession(new NextRequest("http://127.0.0.1:3103/plany", { headers: { cookie } }));
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location")!);
    expect(location.pathname).toBe("/logowanie");
    expect(location.searchParams.get("powod")).toBe("sesja");
  });
});

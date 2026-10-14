import { readJsonObject } from "@/lib/http/json";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let body: { incrementKg?: unknown };
  try { body = await readJsonObject(request, 1024); }
  catch { return NextResponse.json({ error: "Niepoprawne żądanie." }, { status: 400 }); }
  const value = body.incrementKg;
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0 || value > 100 ||
    Math.abs(Math.round(value * 100) - value * 100) > 1e-7) {
    return NextResponse.json({ error: "Podaj krok większy od zera, do 100 kg, z najwyżej dwoma miejscami po przecinku." }, { status: 400 });
  }
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const { error } = await client.from("profiles").update({ rounding_increment_kg: value }).eq("id", auth.user.id);
  if (error) return NextResponse.json({ error: "Nie udało się zapisać kroku." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

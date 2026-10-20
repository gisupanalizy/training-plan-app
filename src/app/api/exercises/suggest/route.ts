import { NextResponse } from "next/server";
import { readJsonObject } from "@/lib/http/json";
import { createClient } from "@/lib/supabase/server";
import { suggestExercises, type SuggestItem } from "@/lib/exercises/decisions";

export async function POST(request: Request) {
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  let items: SuggestItem[];
  try {
    const body = await readJsonObject(request, 64_000);
    if (!Array.isArray(body.items) || body.items.length > 40) throw new Error("lista");
    items = body.items.map((item) => {
      if (!item || typeof item !== "object") throw new Error("pozycja");
      const row = item as Record<string, unknown>;
      if (typeof row.id !== "string" || typeof row.name !== "string" || row.name.length > 120 || row.id.length > 100) throw new Error("pozycja");
      const variant = row.variant == null ? null : typeof row.variant === "string" && row.variant.length <= 120 ? row.variant : null;
      const equipment = row.equipment == null ? null : typeof row.equipment === "string" && row.equipment.length <= 120 ? row.equipment : null;
      if ((row.variant != null && variant === null) || (row.equipment != null && equipment === null)) throw new Error("pozycja");
      return { id: row.id, name: row.name, variant, equipment };
    });
  } catch {
    return NextResponse.json({ error: "Niepoprawna lista nazw." }, { status: 400 });
  }
  const [{ data: aliasRows }, { data: identities }] = await Promise.all([
    client.from("exercise_aliases").select("normalized_name,variant,equipment,identity_id").eq("owner_id", auth.user.id),
    client.from("exercise_identities").select("id,canonical_key").eq("owner_id", auth.user.id),
  ]);
  const keys = new Map((identities ?? []).map((row) => [row.id, row.canonical_key]));
  const aliases = (aliasRows ?? []).flatMap((row) => {
    const canonical_key = keys.get(row.identity_id);
    return canonical_key ? [{ normalized_name: row.normalized_name, variant: row.variant, equipment: row.equipment, canonical_key }] : [];
  });
  try {
    const result = await suggestExercises(items, aliases);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ configured: false, results: items.map((item) => ({ id: item.id, source: null, suggestion: null, aiError: true })) });
  }
}

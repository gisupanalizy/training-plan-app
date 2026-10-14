import { readJsonObject } from "@/lib/http/json";
import { NextResponse } from "next/server";
import { parseOneRepMax } from "@/lib/domain/model";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  let value;
  let operationId: string;
  try {
    const body = await readJsonObject(request, 16384);
    value = parseOneRepMax(body);
    if (typeof body.operationId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.operationId)) throw new Error("Operacja");
    operationId = body.operationId;
  }
  catch { return NextResponse.json({ error: "Podaj ćwiczenie, rzeczywiste 1RM i datę." }, { status: 400 }); }
  const client = await createClient();
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Sesja wygasła." }, { status: 401 });
  const { data: exercise, error: exerciseError } = await client.from("exercises").select("id")
    .eq("id", value.exerciseId).eq("owner_id", auth.user.id).maybeSingle();
  if (exerciseError || !exercise) return NextResponse.json({ error: "Nie znaleziono własnego ćwiczenia." }, { status: 404 });
  const { data, error } = await client.from("one_rep_max_records").insert({
    owner_id: auth.user.id, exercise_id: value.exerciseId, value_kg: value.valueKg,
    effective_on: value.effectiveOn, note: value.note, client_operation_id: operationId,
  }).select("id").single();
  if (error?.code === "23505") {
    const { data: existing } = await client.from("one_rep_max_records")
      .select("id,exercise_id,value_kg,effective_on,note").eq("owner_id", auth.user.id)
      .eq("client_operation_id", operationId).maybeSingle();
    if (existing && existing.exercise_id === value.exerciseId && existing.value_kg === value.valueKg &&
      existing.effective_on === value.effectiveOn && existing.note === value.note) return NextResponse.json({ id: existing.id });
    return NextResponse.json({ error: "Identyfikator operacji użyto dla innego maksimum." }, { status: 409 });
  }
  if (error) return NextResponse.json({ error: "Nie udało się zapisać maksimum." }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
